<?php

namespace App\Policies;

use App\Models\Station;
use App\Models\User;

class StationPolicy
{
    public function viewAny(User $auth): bool { return true; }

    public function view(User $auth, Station $station): bool { return true; }

    public function create(User $auth): bool
    {
        return $auth->isSuperAdmin() || $auth->isAdmin();
    }

    public function update(User $auth, Station $station): bool
    {
        return $auth->isSuperAdmin() || ($auth->isAdmin() && $auth->company_id === $station->company_id);
    }

    public function delete(User $auth, Station $station): bool
    {
        return $auth->isSuperAdmin() || ($auth->isAdmin() && $auth->company_id === $station->company_id);
    }
}
