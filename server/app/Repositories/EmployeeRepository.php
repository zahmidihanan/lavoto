<?php

namespace App\Repositories;

use App\Models\Employee;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EmployeeRepository extends BaseRepository implements EmployeeRepositoryInterface
{
    public function __construct() { parent::__construct(new Employee()); }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Employee::query()->with(['user', 'company', 'station']);

        if (!empty($filters['station_id'])) {
            $query->where('station_id', $filters['station_id']);
        }

        return $this->paginateQuery($this->applyFilters($query, $filters), $filters);
    }

    public function findById(int $id, array $relations = []): ?Employee
    {
        return Employee::with($relations ?: ['user', 'station'])->find($id);
    }

    public function findByUserId(int $userId): ?Employee
    {
        return Employee::where('user_id', $userId)->first();
    }

    public function create(array $data): Employee { return Employee::create($data); }

    public function update(Employee|\Illuminate\Database\Eloquent\Model $employee, array $data): Employee
    {
        $employee->update($data);
        return $employee->fresh(['user', 'station']);
    }

    public function delete(Employee|\Illuminate\Database\Eloquent\Model $employee): bool
    {
        return $employee->delete();
    }

    public function availableForStation(int $stationId, ?string $date = null, ?string $time = null, ?int $excludeBookingId = null): Collection
    {
        $query = Employee::with('user');

        if ($stationId > 0) {
            $query->where('station_id', $stationId);
        }

        if ($date && $time) {
            $query->whereDoesntHave('bookings', function ($q) use ($date, $time, $excludeBookingId) {
                $q->whereDate('booking_date', $date)
                  ->where('booking_time', $time)
                  ->whereNotIn('status', ['cancelled', 'completed']);
                if ($excludeBookingId) {
                    $q->where('bookings.id', '!=', $excludeBookingId);
                }
            });
        }

        return $query->get();
    }

    protected function searchableColumns(): array { return ['employee_code']; }
}
