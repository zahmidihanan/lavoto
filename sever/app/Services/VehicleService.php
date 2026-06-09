<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Vehicle;
use App\Repositories\Contracts\VehicleRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class VehicleService
{
    public function __construct(
        private readonly VehicleRepositoryInterface $vehicleRepo,
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->vehicleRepo->paginate($filters);
    }

    public function findOrFail(int $id): Vehicle
    {
        $vehicle = $this->vehicleRepo->findById($id);
        if (! $vehicle) throw new ApiException('Vehicle not found.', 404);
        return $vehicle;
    }

    public function create(array $data): Vehicle
    {
        return $this->vehicleRepo->create($data);
    }

    public function update(Vehicle $vehicle, array $data): Vehicle
    {
        return $this->vehicleRepo->update($vehicle, $data);
    }

    public function delete(Vehicle $vehicle): void
    {
        $this->vehicleRepo->delete($vehicle);
    }
}
