<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use App\Repositories\Contracts\BookingRepositoryInterface;
use App\Repositories\Contracts\CouponRepositoryInterface;
use App\Repositories\Contracts\ServiceRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class BookingService
{
    public function __construct(
        private readonly BookingRepositoryInterface $bookingRepo,
        private readonly ServiceRepositoryInterface $serviceRepo,
        private readonly CouponRepositoryInterface  $couponRepo,
        private readonly NotificationService        $notificationService,
        private readonly LoyaltyService             $loyaltyService,
        private readonly PaymentService             $paymentService,
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->bookingRepo->paginate($filters);
    }

    public function findOrFail(int $id): Booking
    {
        $booking = $this->bookingRepo->findById($id);
        if (! $booking) throw new ApiException('Booking not found.', 404);
        return $booking;
    }

    public function create(array $data, \App\Models\User $authUser): Booking
    {
        $service = $this->serviceRepo->findById($data['service_id']);
        if (! $service) throw new ApiException('Service not found.', 404);

        // Derive customer_id from vehicle (or from auth user if they are a customer)
        $vehicle = \App\Models\Vehicle::findOrFail($data['vehicle_id']);
        $data['customer_id'] = $vehicle->customer_id;
        $data['company_id']  = $authUser->company_id;

        // Reject booking if date+station is fully booked
        $existingCount = \App\Models\Booking::where('company_id', $data['company_id'])
            ->where('station_id', $data['station_id'] ?? 0)
            ->whereDate('booking_date', $data['booking_date'])
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->count();

        if ($existingCount >= 20) {
            throw new ApiException('This date is fully booked. Please choose another date.', 422);
        }

        $totalAmount    = (float) $service->price;
        $discountAmount = 0.0;

        if (!empty($data['coupon_code'])) {
            $coupon = $this->couponRepo->findByCode($data['coupon_code']);

            if (! $coupon || ! $coupon->isValid($totalAmount)) {
                throw new ApiException('Invalid or expired coupon.', 422);
            }

            $discountAmount = $coupon->calculateDiscount($totalAmount);
            $data['coupon_id'] = $coupon->id;
            $this->couponRepo->incrementUsage($coupon);
        }

        unset($data['coupon_code']);

        $booking = $this->bookingRepo->create(array_merge($data, [
            'total_amount'    => $totalAmount - $discountAmount,
            'discount_amount' => $discountAmount,
            'status'          => 'pending',
        ]));

        Payment::create([
            'booking_id'      => $booking->id,
            'amount'          => $booking->total_amount,
            'payment_method'  => 'cash',
            'payment_status'  => 'pending',
        ]);

        $booking->load('customer.user', 'service', 'station');

        $customerName = $booking->customer?->user?->name ?? 'A customer';
        $serviceName  = $booking->service?->name ?? '';

        if ($booking->customer) {
            $this->notificationService->send(
                $booking->customer->user_id,
                'Booking Confirmed',
                "Your booking #{$booking->id} has been received.",
                'booking_created',
                ['booking_id' => $booking->id]
            );
        }

        // Notify admins (dedup handled inside notifyAdmins)
        $this->notifyAdmins(
            $booking,
            'New Booking',
            "{$customerName} booked {$serviceName} at {$booking->booking_time} on {$booking->booking_date}",
            'booking_created'
        );

        return $booking;
    }

    public function updateStatus(Booking $booking, string $status, array $extra = []): Booking
    {
        $validTransitions = [
            'pending'       => ['confirmed', 'cancelled'],
            'confirmed'     => ['assigned', 'cancelled'],
            'assigned'      => ['in_progress', 'cancelled'],
            'in_progress'   => ['quality_check', 'completed'],
            'quality_check' => ['completed', 'in_progress'],
            'completed'     => [],
            'cancelled'     => [],
        ];

        if (! in_array($status, $validTransitions[$booking->status] ?? [])) {
            throw new ApiException("Cannot transition from {$booking->status} to {$status}.", 422);
        }

        $updateData = ['status' => $status];

        if ($status === 'cancelled') {
            $updateData['cancelled_at']         = now();
            $updateData['cancellation_reason']  = $extra['cancellation_reason'] ?? null;
        }

        if ($status === 'completed') {
            $this->loyaltyService->awardPoints($booking);

            $payment = $booking->payment()->first();

            if ($payment && $payment->payment_status === 'pending') {
                $payment->update([
                    'payment_status' => 'paid',
                    'paid_at'        => now(),
                ]);
            } elseif (! $payment) {
                try {
                    $this->paymentService->createForBooking($booking->refresh(), [
                        'payment_method' => 'cash',
                        'amount'         => $booking->total_amount,
                    ]);
                } catch (\Exception) {
                    // race condition — payment created by another request
                }
            }

        }

        $updated = $this->bookingRepo->updateStatus($booking, $status, $updateData);

        $updated->load('customer.user', 'service');

        $customerName = $updated->customer?->user?->name ?? 'A customer';
        $serviceName  = $updated->service?->name ?? 'N/A';
        $adminTitle   = match ($status) {
            'confirmed' => 'Booking Confirmed',
            'cancelled' => 'Booking Cancelled',
            default     => "Booking {$status}",
        };
        $adminBody    = match ($status) {
            'confirmed' => "Booking for {$customerName} has been confirmed.",
            'cancelled' => "Booking for {$customerName} has been cancelled.",
            default     => "Booking #{$updated->id} is now {$status} — {$customerName} • {$serviceName}",
        };

        if ($booking->customer) {
            $this->notificationService->send(
                $booking->customer->user_id,
                'Booking Status Updated',
                "Your booking #{$booking->id} is now: {$status}.",
                'booking_status',
                ['booking_id' => $booking->id, 'status' => $status]
            );
        }

        $this->notifyAdmins($updated, $adminTitle, $adminBody, 'booking_status');

        return $updated;
    }

    public function assignEmployees(Booking $booking, array $employeeIds): Booking
    {
        if ($booking->status !== 'confirmed') {
            throw new ApiException('Employees can only be assigned to confirmed bookings.', 422);
        }

        $this->bookingRepo->assignEmployees($booking, $employeeIds);
        $this->bookingRepo->updateStatus($booking, 'assigned');

        $updated = $this->bookingRepo->findById($booking->id);
        $updated->load('customer.user', 'service');

        if ($booking->customer) {
            $this->notificationService->send(
                $booking->customer->user_id,
                'Employees Assigned',
                "Employees have been assigned to your booking #{$booking->id}.",
                'booking_assigned',
                ['booking_id' => $booking->id, 'employee_ids' => $employeeIds]
            );
        }

        $empCustomerName = $updated->customer?->user?->name ?? 'N/A';
        $empServiceName  = $updated->service?->name ?? 'N/A';

        $this->notifyAdmins(
            $updated,
            'Employees Assigned',
            "Employees assigned to booking #{$updated->id} — {$empCustomerName} • {$empServiceName}",
            'booking_assigned',
        );

        return $updated;
    }

    public function cancel(Booking $booking, string $reason = ''): Booking
    {
        return $this->updateStatus($booking, 'cancelled', ['cancellation_reason' => $reason]);
    }

    public function delete(Booking $booking): void
    {
        $this->bookingRepo->delete($booking);
    }

    private function notifyAdmins(\App\Models\Booking $booking, string $title, string $body, string $type): void
    {
        $admins = User::query()
            ->where(function ($q) use ($booking) {
                $q->whereNull('company_id')
                  ->orWhere('company_id', $booking->company_id);
            })
            ->whereHas('roles', fn($q) => $q->where('name', 'admin'))
            ->get();

        foreach ($admins as $admin) {
            // Prevent duplicate: skip if same type+booking_id sent within last minute
            $recent = \App\Models\Notification::where('user_id', $admin->id)
                ->where('type', $type)
                ->where('created_at', '>=', now()->subMinute())
                ->get()
                ->contains(fn($n) => ($n->data['booking_id'] ?? null) == $booking->id);

            if ($recent) {
                continue;
            }

            $this->notificationService->send(
                userId: $admin->id,
                title:  $title,
                body:   $body,
                type:   $type,
                data:   [
                    'booking_id'    => $booking->id,
                    'customer_name' => $booking->customer?->user?->name ?? 'N/A',
                    'service_name'  => $booking->service?->name ?? 'N/A',
                    'amount'        => $booking->total_amount,
                ],
            );
        }
    }
}
