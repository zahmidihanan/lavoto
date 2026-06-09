<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Customer;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class CustomerService
{
    public function __construct(
        private readonly CustomerRepositoryInterface $customerRepo,
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->customerRepo->paginate($filters);
    }

    public function findOrFail(int $id): Customer
    {
        $customer = $this->customerRepo->findById($id);
        if (! $customer) throw new ApiException('Customer not found.', 404);
        return $customer;
    }

    public function update(Customer $customer, array $data): Customer
    {
        return $this->customerRepo->update($customer, $data);
    }

    public function delete(Customer $customer): void
    {
        $this->customerRepo->delete($customer);
    }
}
