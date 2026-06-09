<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Employee;
use App\Models\User;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EmployeeService
{
    public function __construct(
        private readonly EmployeeRepositoryInterface $employeeRepo,
        private readonly UserRepositoryInterface     $userRepo,
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->employeeRepo->paginate($filters);
    }

    public function findOrFail(int $id): Employee
    {
        $employee = $this->employeeRepo->findById($id);
        if (! $employee) throw new ApiException('Employee not found.', 404);
        return $employee;
    }

    public function create(array $data): Employee
    {
        $user = User::create([
            'name'       => $data['name'],
            'email'      => $data['email'],
            'phone'      => $data['phone'] ?? null,
            'password'   => Hash::make($data['password'] ?? Str::random(12)),
            'company_id' => $data['company_id'],
            'station_id' => $data['station_id'] ?? null,
            'status'     => 'active',
        ]);

        $user->assignRole('employee');

        return $this->employeeRepo->create([
            'user_id'       => $user->id,
            'company_id'    => $data['company_id'],
            'station_id'    => $data['station_id'] ?? null,
            'employee_code' => $data['employee_code'] ?? strtoupper(Str::random(8)),
            'hire_date'     => $data['hire_date'],
            'salary'        => $data['salary'] ?? null,
        ]);
    }

    public function update(Employee $employee, array $data): Employee
    {
        if (isset($data['name']) || isset($data['email']) || isset($data['phone'])) {
            $employee->user->update(array_filter([
                'name'  => $data['name']  ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
            ]));
        }

        return $this->employeeRepo->update($employee, array_intersect_key($data, array_flip([
            'station_id', 'employee_code', 'hire_date', 'salary',
        ])));
    }

    public function delete(Employee $employee): void
    {
        $this->employeeRepo->delete($employee);
        $employee->user->delete();
    }

    public function availableForStation(int $stationId): Collection
    {
        return $this->employeeRepo->availableForStation($stationId);
    }
}
