<?php

namespace App\Policies;

use App\Models\Service;
use App\Models\User;

class ServicePolicy
{
    public function viewAny(User $auth): bool { return true; }

    public function view(User $auth, Service $service): bool { return true; }

    public function create(User $auth): bool
    {
        return $auth->isSuperAdmin() || $auth->isAdmin();
    }

    public function update(User $auth, Service $service): bool
    {
        return $auth->isSuperAdmin() || ($auth->isAdmin() && $auth->company_id === $service->company_id);
    }

    public function delete(User $auth, Service $service): bool
    {
        return $auth->isSuperAdmin() || ($auth->isAdmin() && $auth->company_id === $service->company_id);
    }
}
