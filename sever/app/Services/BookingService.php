<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Booking;
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

    public function create(array $data): Booking
    {
        $service = $this->serviceRepo->findById($data['service_id']);
        if (! $service) throw new ApiException('Service not found.', 404);

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

        $this->notificationService->send(
            $booking->customer->user_id,
            'Booking Confirmed',
            "Your booking #{$booking->id} has been received.",
            'booking_created',
            ['booking_id' => $booking->id]
        );

        return $booking;
    }

    public function updateStatus(Booking $booking, string $status, array $extra = []): Booking
    {
        $validTransitions = [
            'pending'       => ['confirmed', 'cancelled'],
            'confirmed'     => ['assigned', 'cancelled'],
            'assigned'      => ['in_progress', 'cancelled'],
            'in_progress'   => ['quality_check'],
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
        }

        $updated = $this->bookingRepo->updateStatus($booking, $status, $updateData);

        $this->notificationService->send(
            $booking->customer->user_id,
            'Booking Status Updated',
            "Your booking #{$booking->id} is now: {$status}.",
            'booking_status',
            ['booking_id' => $booking->id, 'status' => $status]
        );

        return $updated;
    }

    public function assignEmployees(Booking $booking, array $employeeIds): Booking
    {
        if ($booking->status !== 'confirmed') {
            throw new ApiException('Employees can only be assigned to confirmed bookings.', 422);
        }

        $this->bookingRepo->assignEmployees($booking, $employeeIds);
        $this->bookingRepo->updateStatus($booking, 'assigned');

        return $this->bookingRepo->findById($booking->id);
    }

    public function cancel(Booking $booking, string $reason = ''): Booking
    {
        return $this->updateStatus($booking, 'cancelled', ['cancellation_reason' => $reason]);
    }

    public function delete(Booking $booking): void
    {
        $this->bookingRepo->delete($booking);
    }
}
