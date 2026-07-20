<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function viewAny(User $auth): bool { return true; }

    public function view(User $auth, Booking $booking): bool
    {
        if ($auth->isSuperAdmin()) return true;
        if ($auth->customer && $auth->customer->id === $booking->customer_id) return true;
        return $auth->company_id === $booking->company_id;
    }

    public function create(User $auth): bool { return true; }

    public function updateStatus(User $auth, Booking $booking): bool
    {
        if ($auth->isSuperAdmin()) return true;
        return $auth->company_id === $booking->company_id && ($auth->isAdmin() || $auth->isEmployee());
    }

    public function cancel(User $auth, Booking $booking): bool
    {
        if ($auth->isSuperAdmin()) return true;
        if ($auth->customer && $auth->customer->id === $booking->customer_id) return true;
        return $auth->isAdmin() && $auth->company_id === $booking->company_id;
    }

    public function assignEmployees(User $auth, Booking $booking): bool
    {
        return $auth->isSuperAdmin() || ($auth->isAdmin() && $auth->company_id === $booking->company_id);
    }
}
