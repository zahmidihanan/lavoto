<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $auth): bool
    {
        return $auth->isSuperAdmin() || $auth->can('users.view');
    }

    public function view(User $auth, User $user): bool
    {
        if ($auth->isSuperAdmin()) return true;
        if ($auth->id === $user->id) return true;
        return $auth->can('users.view') && $auth->company_id === $user->company_id;
    }

    public function create(User $auth): bool
    {
        return $auth->isSuperAdmin() || $auth->can('users.create');
    }

    public function update(User $auth, User $user): bool
    {
        if ($auth->isSuperAdmin()) return true;
        if ($auth->id === $user->id) return true;
        return $auth->can('users.edit') && $auth->company_id === $user->company_id;
    }

    public function delete(User $auth, User $user): bool
    {
        if ($auth->id === $user->id) return false;
        return $auth->isSuperAdmin() || ($auth->can('users.delete') && $auth->company_id === $user->company_id);
    }
}
