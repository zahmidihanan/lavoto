<?php

namespace App\Repositories;

use App\Models\Customer;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class CustomerRepository extends BaseRepository implements CustomerRepositoryInterface
{
    public function __construct() { parent::__construct(new Customer()); }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Customer::query()->with(['user', 'company']);
        return $this->paginate($this->applyFilters($query, $filters), $filters);
    }

    public function findById(int $id, array $relations = []): ?Customer
    {
        return Customer::with($relations ?: ['user', 'company'])->find($id);
    }

    public function findByUserId(int $userId): ?Customer
    {
        return Customer::where('user_id', $userId)->first();
    }

    public function create(array $data): Customer { return Customer::create($data); }

    public function update(Customer|\Illuminate\Database\Eloquent\Model $customer, array $data): Customer
    {
        $customer->update($data);
        return $customer->fresh(['user']);
    }

    public function delete(Customer|\Illuminate\Database\Eloquent\Model $customer): bool
    {
        return $customer->delete();
    }

    protected function searchableColumns(): array { return ['address']; }
}
