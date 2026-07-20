<?php

namespace App\Repositories\Contracts;

use App\Models\Vehicle;
use Illuminate\Pagination\LengthAwarePaginator;

interface VehicleRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;
    public function findById(int $id, array $relations = []): ?Vehicle;
    public function forCustomer(int $customerId): \Illuminate\Database\Eloquent\Collection;
    public function create(array $data): Vehicle;
    public function update(Vehicle $vehicle, array $data): Vehicle;
    public function delete(Vehicle $vehicle): bool;
}
