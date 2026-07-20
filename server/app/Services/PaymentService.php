<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use App\Services\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Response;

class PaymentService
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepo,
        private readonly NotificationService $notificationService,
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->paymentRepo->paginate($filters);
    }

    public function findOrFail(int $id): Payment
    {
        $payment = $this->paymentRepo->findById($id);
        if (! $payment) throw new ApiException('Payment not found.', 404);
        return $payment;
    }

    public function createForBooking(Booking $booking, array $data): Payment
    {
        $existing = $this->paymentRepo->findByBooking($booking->id);

        if ($existing && $existing->payment_status === 'paid') {
            throw new ApiException('A payment has already been recorded for this booking.', 422);
        }

        if (! in_array($booking->status, ['confirmed', 'assigned', 'in_progress', 'completed'])) {
            throw new ApiException('Cannot process payment for a booking in this state.', 422);
        }

        if ($existing && $existing->payment_status === 'pending') {
            $this->paymentRepo->update($existing, [
                'payment_status' => 'paid',
                'paid_at'        => now(),
                'payment_method' => $data['payment_method'] ?? $existing->payment_method,
                'transaction_reference' => $data['transaction_reference'] ?? $existing->transaction_reference,
                'notes'          => $data['notes'] ?? $existing->notes,
            ]);
            $payment = $existing->fresh()->load('booking.customer.user');
            $this->notifyAdmins($payment, 'created');
            return $payment;
        }

        $payment = $this->paymentRepo->create(array_merge($data, [
            'booking_id'    => $booking->id,
            'amount'        => $booking->total_amount,
            'payment_status' => 'paid',
            'paid_at'       => now(),
        ]));

        $this->notifyAdmins($payment, 'created');

        return $payment;
    }

    public function update(Payment $payment, array $data): Payment
    {
        $wasPaid = $payment->payment_status === 'paid';
        if (($data['payment_status'] ?? null) === 'paid' && ! isset($data['paid_at'])) {
            $data['paid_at'] = now();
        }
        $this->paymentRepo->update($payment, $data);
        $updated = $payment->fresh()->load('booking.customer.user');
        if (! $wasPaid && $updated->payment_status === 'paid') {
            $this->notifyAdmins($updated, 'created');
        }
        return $updated;
    }

    public function delete(Payment $payment): void
    {
        $this->paymentRepo->delete($payment);
    }

    public function refund(Payment $payment, string $reason = ''): Payment
    {
        if ($payment->payment_status !== 'paid') {
            throw new ApiException('Only paid payments can be refunded.', 422);
        }

        $refunded = $this->paymentRepo->update($payment, [
            'payment_status' => 'refunded',
            'notes'          => $reason ?: $payment->notes,
        ]);

        $this->notifyAdmins($payment, 'refunded');

        return $refunded;
    }

    private function notifyAdmins(Payment $payment, string $action): void
    {
        $booking = $payment->booking()->with(['customer.user', 'service'])->first();
        if (! $booking) return;

        $companyId    = $booking->company_id;
        $customerName = $booking->customer?->user?->name ?? 'A customer';
        $serviceName  = $booking->service?->name ?? 'Service';
        $amount       = number_format((float) $payment->amount, 2);

        $titles = [
            'created'  => 'New Payment Received',
            'refunded' => 'Payment Refunded',
        ];

        $bodies = [
            'created'  => "{$customerName} • {$serviceName} — MAD {$amount}",
            'refunded' => "{$customerName} • {$serviceName} — MAD {$amount} (Refunded)",
        ];

        $admins = User::query()
            ->where(function ($q) use ($companyId) {
                $q->whereNull('company_id')
                  ->orWhere('company_id', $companyId);
            })
            ->whereHas('roles', fn($q) => $q->where('name', 'admin'))
            ->get();

        foreach ($admins as $admin) {
            $this->notificationService->send(
                userId: $admin->id,
                title:  $titles[$action] ?? 'Payment Update',
                body:   $bodies[$action] ?? '',
                type:   'payment',
                data:   [
                    'payment_id' => $payment->id,
                    'booking_id' => $booking->id,
                    'amount'     => $payment->amount,
                    'action'     => $action,
                ],
            );
        }
    }

    public function import(array $rows): array
    {
        $imported = 0;
        $errors  = [];

        foreach ($rows as $i => $row) {
            $line = $i + 2;

            if (empty($row['booking_id'])) {
                $errors[] = "Row {$line}: booking_id is required";
                continue;
            }

            $booking = Booking::find($row['booking_id']);
            if (! $booking) {
                $errors[] = "Row {$line}: Booking #{$row['booking_id']} not found";
                continue;
            }

            if ($this->paymentRepo->findByBooking($booking->id)) {
                $errors[] = "Row {$line}: Payment already exists for booking #{$booking->id}";
                continue;
            }

            try {
                $this->createForBooking($booking, [
                    'payment_method'        => $row['payment_method'] ?? 'cash',
                    'transaction_reference' => $row['transaction_reference'] ?? null,
                    'notes'                 => $row['notes'] ?? null,
                    'paid_at'               => $row['paid_at'] ?? null,
                ]);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row {$line}: {$e->getMessage()}";
            }
        }

        return ['imported' => $imported, 'errors' => $errors];
    }

    public function exportWord(): \Illuminate\Http\Response
    {
        $payments = $this->paymentRepo->paginate(['per_page' => 1000])->items();

        $html = '
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:w="urn:schemas-microsoft-com:office:word"
              xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; font-size: 11pt; }
            h1 { font-size: 18pt; margin-bottom: 8px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; }
            th { background: #e0e0e0; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .status-paid { color: #16a34a; font-weight: bold; }
            .status-pending { color: #d97706; font-weight: bold; }
            .status-refunded { color: #6b7280; font-weight: bold; }
            .status-failed { color: #dc2626; font-weight: bold; }
        </style>
        </head><body>
        <h1>Payments Report</h1>
        <p>Generated: ' . now()->format('Y-m-d H:i') . '</p>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Booking ID</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Reference</th>
                    <th>Notes</th>
                    <th>Paid At</th>
                </tr>
            </thead>
            <tbody>';

        foreach ($payments as $p) {
            $statusClass = 'status-' . $p->payment_status;
            $html .= '<tr>
                <td>' . $p->id . '</td>
                <td>' . $p->booking_id . '</td>
                <td class="text-right">MAD ' . number_format((float) $p->amount, 2) . '</td>
                <td class="text-center">' . ucfirst($p->payment_method) . '</td>
                <td class="text-center ' . $statusClass . '">' . ucfirst($p->payment_status) . '</td>
                <td>' . e($p->transaction_reference ?? '—') . '</td>
                <td>' . e($p->notes ?? '—') . '</td>
                <td>' . ($p->paid_at ? $p->paid_at->format('Y-m-d H:i') : '—') . '</td>
            </tr>';
        }

        $html .= '
            </tbody>
        </table>
        </body></html>';

        return Response::make($html, 200, [
            'Content-Type'        => 'application/msword',
            'Content-Disposition' => 'attachment; filename="payments_' . now()->format('Ymd_His') . '.doc"',
        ]);
    }
}
