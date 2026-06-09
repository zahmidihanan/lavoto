<?php

namespace App\Repositories;

use App\Models\Service;
use App\Repositories\Contracts\ServiceRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ServiceRepository extends BaseRepository implements ServiceRepositoryInterface
{
    public function __construct() { parent::__construct(new Service()); }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Service::query();

        if (isset($filters['is_active'])) {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        return $this->paginateQuery($this->applyFilters($query, $filters), $filters);
    }

    public function findById(int $id, array $relations = []): ?Service
    {
        return Service::find($id);
    }

    public function active(): Collection
    {
        return Service::where('is_active', true)->orderBy('name')->get();
    }

    public function create(array $data): Service { return Service::create($data); }

    public function update(Service|\Illuminate\Database\Eloquent\Model $service, array $data): Service
    {
        $service->update($data);
        return $service->fresh();
    }

    public function delete(Service|\Illuminate\Database\Eloquent\Model $service): bool
    {
        return $service->delete();
    }

    protected function searchableColumns(): array { return ['name', 'description']; }
}
