<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vehicle;

class VehiclePolicy
{
    public function viewAny(User $auth): bool
    {
        return true;
    }

    public function view(User $auth, Vehicle $vehicle): bool
    {
        if ($auth->isSuperAdmin()) return true;
        if ($auth->customer && $auth->customer->id === $vehicle->customer_id) return true;
        return $auth->company_id === $vehicle->company_id;
    }

    public function create(User $auth): bool
    {
        return true;
    }

    public function update(User $auth, Vehicle $vehicle): bool
    {
        if ($auth->isSuperAdmin()) return true;
        if ($auth->customer && $auth->customer->id === $vehicle->customer_id) return true;
        return $auth->isAdmin() && $auth->company_id === $vehicle->company_id;
    }

    public function delete(User $auth, Vehicle $vehicle): bool
    {
        if ($auth->isSuperAdmin()) return true;
        if ($auth->customer && $auth->customer->id === $vehicle->customer_id) return true;
        return $auth->isAdmin() && $auth->company_id === $vehicle->company_id;
    }
}
