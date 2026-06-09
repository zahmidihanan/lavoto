<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Customer;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepo,
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->userRepo->paginate($filters);
    }

    public function findOrFail(int $id): User
    {
        $user = $this->userRepo->findById($id, ['company', 'station']);
        if (! $user) throw new ApiException('User not found.', 404);
        return $user;
    }

    public function create(array $data, string $role): User
    {
        $data['password'] = Hash::make($data['password']);
        $data['status']   = $data['status'] ?? 'active';
        $user = $this->userRepo->create($data);
        $user->assignRole($role);

        if ($role === 'customer') {
            Customer::create([
                'user_id'    => $user->id,
                'company_id' => $user->company_id,
                'address'    => $data['address'] ?? null,
            ]);
        }

        return $user->load('company');
    }

    public function update(User $user, array $data): User
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        return $this->userRepo->update($user, $data);
    }

    public function delete(User $user): void
    {
        $this->userRepo->delete($user);
    }
}
