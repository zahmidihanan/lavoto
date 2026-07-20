<?php

namespace App\Repositories;

use App\Models\Vehicle;
use App\Repositories\Contracts\VehicleRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class VehicleRepository extends BaseRepository implements VehicleRepositoryInterface
{
    public function __construct() { parent::__construct(new Vehicle()); }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Vehicle::query()->with('customer.user');

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        return $this->paginateQuery($this->applyFilters($query, $filters), $filters);
    }

    public function findById(int $id, array $relations = []): ?Vehicle
    {
        return Vehicle::with($relations ?: ['customer.user'])->find($id);
    }

    public function forCustomer(int $customerId): Collection
    {
        return Vehicle::where('customer_id', $customerId)->get();
    }

    public function create(array $data): Vehicle { return Vehicle::create($data); }

    public function update(Vehicle|\Illuminate\Database\Eloquent\Model $vehicle, array $data): Vehicle
    {
        $vehicle->update($data);
        return $vehicle->fresh();
    }

    public function delete(Vehicle|\Illuminate\Database\Eloquent\Model $vehicle): bool
    {
        return $vehicle->delete();
    }

    protected function searchableColumns(): array { return ['brand', 'model', 'plate_number']; }
}
