<?php

namespace App\Repositories\Contracts;

use App\Models\Service;
use Illuminate\Pagination\LengthAwarePaginator;

interface ServiceRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;
    public function findById(int $id, array $relations = []): ?Service;
    public function active(): \Illuminate\Database\Eloquent\Collection;
    public function create(array $data): Service;
    public function update(Service $service, array $data): Service;
    public function delete(Service $service): bool;
}
