<?php

namespace App\Repositories\Contracts;

use App\Models\Employee;
use Illuminate\Pagination\LengthAwarePaginator;

interface EmployeeRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;
    public function findById(int $id, array $relations = []): ?Employee;
    public function findByUserId(int $userId): ?Employee;
    public function create(array $data): Employee;
    public function update(Employee $employee, array $data): Employee;
    public function delete(Employee $employee): bool;
    public function availableForStation(int $stationId, ?string $date = null, ?string $time = null, ?int $excludeBookingId = null): \Illuminate\Database\Eloquent\Collection;
}
