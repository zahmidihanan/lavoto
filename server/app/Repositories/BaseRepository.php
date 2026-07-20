<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class BaseRepository
{
    public function __construct(protected readonly Model $model) {}

    public function findById(int $id, array $relations = []): ?Model
    {
        return $this->model->newQuery()->with($relations)->find($id);
    }

    public function findOrFail(int $id, array $relations = []): Model
    {
        return $this->model->newQuery()->with($relations)->findOrFail($id);
    }

    public function create(array $data): Model
    {
        return $this->model->newQuery()->create($data);
    }

    public function update(Model $model, array $data): Model
    {
        $model->update($data);
        return $model->fresh();
    }

    public function delete(Model $model): bool
    {
        return $model->delete();
    }

    protected function applyFilters(Builder $query, array $filters): Builder
    {
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                foreach ($this->searchableColumns() as $col) {
                    $q->orWhere($col, 'like', "%{$filters['search']}%");
                }
            });
        }

        $sortBy  = $filters['sort_by']  ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query;
    }

    protected function paginateQuery(Builder $query, array $filters): LengthAwarePaginator
    {
        return $query->paginate($filters['per_page'] ?? 15);
    }

    protected function searchableColumns(): array { return []; }
}
