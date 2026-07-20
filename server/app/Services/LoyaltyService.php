<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\LoyaltyTransaction;

class LoyaltyService
{
    private const POINTS_PER_CURRENCY_UNIT = 1; // 1 point per 1 unit of currency

    public function awardPoints(Booking $booking): LoyaltyTransaction
    {
        $points   = (int) floor($booking->total_amount * self::POINTS_PER_CURRENCY_UNIT);
        $customer = $booking->customer;

        $customer->increment('loyalty_points', $points);

        return LoyaltyTransaction::create([
            'customer_id' => $customer->id,
            'booking_id'  => $booking->id,
            'points'      => $points,
            'type'        => 'earned',
            'description' => "Points earned for booking #{$booking->id}",
        ]);
    }

    public function redeemPoints(Customer $customer, int $points, ?int $bookingId = null): LoyaltyTransaction
    {
        if ($customer->loyalty_points < $points) {
            throw new ApiException("Insufficient loyalty points. Available: {$customer->loyalty_points}.", 422);
        }

        $customer->decrement('loyalty_points', $points);

        return LoyaltyTransaction::create([
            'customer_id' => $customer->id,
            'booking_id'  => $bookingId,
            'points'      => -$points,
            'type'        => 'redeemed',
            'description' => "Redeemed {$points} points",
        ]);
    }

    public function transactions(Customer $customer, array $filters): \Illuminate\Pagination\LengthAwarePaginator
    {
        return $customer->loyaltyTransactions()
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }
}
