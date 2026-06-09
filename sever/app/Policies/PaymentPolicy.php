<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $auth): bool
    {
        return $auth->isSuperAdmin() || $auth->isAdmin() || $auth->isEmployee();
    }

    public function view(User $auth, Payment $payment): bool
    {
        if ($auth->isSuperAdmin()) return true;
        $booking = $payment->booking;
        if ($auth->customer && $booking && $auth->customer->id === $booking->customer_id) return true;
        return $auth->company_id === $booking?->company_id;
    }

    public function create(User $auth): bool
    {
        return $auth->isSuperAdmin() || $auth->isAdmin() || $auth->isEmployee();
    }

    public function refund(User $auth, Payment $payment): bool
    {
        return $auth->isSuperAdmin() || ($auth->isAdmin() && $auth->company_id === $payment->booking?->company_id);
    }
}
