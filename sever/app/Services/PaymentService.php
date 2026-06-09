<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Booking;
use App\Models\Payment;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class PaymentService
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepo,
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
        if ($this->paymentRepo->findByBooking($booking->id)) {
            throw new ApiException('A payment already exists for this booking.', 422);
        }

        if (! in_array($booking->status, ['confirmed', 'assigned', 'in_progress', 'completed'])) {
            throw new ApiException('Cannot process payment for a booking in this state.', 422);
        }

        $payment = $this->paymentRepo->create(array_merge($data, [
            'booking_id'    => $booking->id,
            'amount'        => $booking->total_amount,
            'payment_status' => 'paid',
            'paid_at'       => now(),
        ]));

        return $payment;
    }

    public function refund(Payment $payment, string $reason = ''): Payment
    {
        if ($payment->payment_status !== 'paid') {
            throw new ApiException('Only paid payments can be refunded.', 422);
        }

        return $this->paymentRepo->update($payment, [
            'payment_status' => 'refunded',
            'notes'          => $reason ?: $payment->notes,
        ]);
    }
}
