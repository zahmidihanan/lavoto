<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;

class EmployeePolicy
{
    public function viewAny(User $auth): bool
    {
        return $auth->isSuperAdmin() || $auth->isAdmin() || $auth->isEmployee();
    }

    public function view(User $auth, Employee $employee): bool
    {
        if ($auth->isSuperAdmin()) return true;
        return $auth->company_id === $employee->company_id;
    }

    public function create(User $auth): bool
    {
        return $auth->isSuperAdmin() || $auth->isAdmin();
    }

    public function update(User $auth, Employee $employee): bool
    {
        return $auth->isSuperAdmin() || ($auth->isAdmin() && $auth->company_id === $employee->company_id);
    }

    public function delete(User $auth, Employee $employee): bool
    {
        return $auth->isSuperAdmin() || ($auth->isAdmin() && $auth->company_id === $employee->company_id);
    }
}
