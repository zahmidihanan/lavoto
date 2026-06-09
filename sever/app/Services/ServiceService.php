<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Service;
use App\Repositories\Contracts\ServiceRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ServiceService
{
    public function __construct(
        private readonly ServiceRepositoryInterface $serviceRepo,
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->serviceRepo->paginate($filters);
    }

    public function active(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->serviceRepo->active();
    }

    public function findOrFail(int $id): Service
    {
        $service = $this->serviceRepo->findById($id);
        if (! $service) throw new ApiException('Service not found.', 404);
        return $service;
    }

    public function create(array $data): Service
    {
        return $this->serviceRepo->create($data);
    }

    public function update(Service $service, array $data): Service
    {
        return $this->serviceRepo->update($service, $data);
    }

    public function delete(Service $service): void
    {
        $this->serviceRepo->delete($service);
    }
}
