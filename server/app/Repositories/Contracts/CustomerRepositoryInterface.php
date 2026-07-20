<?php

namespace App\Repositories\Contracts;

use App\Models\Customer;
use Illuminate\Pagination\LengthAwarePaginator;

interface CustomerRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;
    public function findById(int $id, array $relations = []): ?Customer;
    public function findByUserId(int $userId): ?Customer;
    public function create(array $data): Customer;
    public function update(Customer $customer, array $data): Customer;
    public function delete(Customer $customer): bool;
}
