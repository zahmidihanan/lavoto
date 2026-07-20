<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    public function create(User $auth): bool
    {
        return $auth->isSuperAdmin() || $auth->isAdmin();
    }

    public function viewAny(User $auth): bool
    {
        return $auth->isSuperAdmin() || $auth->isAdmin() || $auth->isEmployee();
    }

    public function view(User $auth, Customer $customer): bool
    {
        if ($auth->isSuperAdmin()) return true;
        if ($auth->customer?->id === $customer->id) return true;
        return ($auth->isAdmin() || $auth->isEmployee()) && $auth->company_id === $customer->company_id;
    }

    public function update(User $auth, Customer $customer): bool
    {
        if ($auth->isSuperAdmin()) return true;
        if ($auth->customer?->id === $customer->id) return true;
        return $auth->isAdmin() && $auth->company_id === $customer->company_id;
    }

    public function delete(User $auth, Customer $customer): bool
    {
        return $auth->isSuperAdmin() || ($auth->isAdmin() && $auth->company_id === $customer->company_id);
    }
}
