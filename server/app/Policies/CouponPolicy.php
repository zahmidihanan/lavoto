<?php

namespace App\Policies;

use App\Models\Coupon;
use App\Models\User;

class CouponPolicy
{
    public function viewAny(User $auth): bool
    {
        return $auth->isSuperAdmin() || $auth->isAdmin();
    }

    public function view(User $auth, Coupon $coupon): bool
    {
        return $auth->isSuperAdmin() || ($auth->isAdmin() && $auth->company_id === $coupon->company_id);
    }

    public function create(User $auth): bool
    {
        return $auth->isSuperAdmin() || $auth->isAdmin();
    }

    public function update(User $auth, Coupon $coupon): bool
    {
        return $auth->isSuperAdmin() || ($auth->isAdmin() && $auth->company_id === $coupon->company_id);
    }

    public function delete(User $auth, Coupon $coupon): bool
    {
        return $auth->isSuperAdmin() || ($auth->isAdmin() && $auth->company_id === $coupon->company_id);
    }
}
