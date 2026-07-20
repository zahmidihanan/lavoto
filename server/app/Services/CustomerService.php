<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Customer;
use App\Models\User;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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

    public function create(array $data): Customer
    {
        $user = User::create([
            'name'       => $data['name'],
            'email'      => $data['email'],
            'phone'      => $data['phone'] ?? null,
            'password'   => Hash::make($data['password'] ?? Str::random(12)),
            'company_id' => $data['company_id'],
            'status'     => 'active',
        ]);

        $user->assignRole('customer');

        return $this->customerRepo->create([
            'user_id'    => $user->id,
            'company_id' => $data['company_id'],
        ]);
    }

    public function update(Customer $customer, array $data): Customer
    {
        if (isset($data['name']) || isset($data['email']) || isset($data['phone'])) {
            $customer->user->update(array_filter([
                'name'  => $data['name']  ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
            ]));
        }

        return $this->customerRepo->update($customer, array_intersect_key($data, array_flip([
            'address',
        ])));
    }

    public function delete(Customer $customer): void
    {
        $this->customerRepo->delete($customer);
        $customer->user->delete();
    }
}
