<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    public function __construct() { parent::__construct(new User()); }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = User::query()->with(['company', 'station']);

        if (!empty($filters['role'])) {
            $query->role($filters['role']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $this->paginateQuery($this->applyFilters($query, $filters), $filters);
    }

    public function findById(int $id, array $relations = []): ?User
    {
        return User::with($relations ?: ['company', 'station'])->find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::withoutGlobalScopes()->where('email', $email)->first();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User|\Illuminate\Database\Eloquent\Model $user, array $data): User
    {
        $user->update($data);
        return $user->fresh(['company', 'station']);
    }

    public function delete(User|\Illuminate\Database\Eloquent\Model $user): bool
    {
        return $user->delete();
    }

    protected function searchableColumns(): array { return ['name', 'email', 'phone']; }
}
