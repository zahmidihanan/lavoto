<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\CustomerService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly CustomerService $customerService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Customer::class);
        $paginator = $this->customerService->paginate($request->all());
        return $this->paginated(CustomerResource::collection($paginator));
    }

    public function show(Customer $customer): JsonResponse
    {
        $this->authorize('view', $customer);
        $customer->load(['user', 'vehicles']);
        return $this->success(new CustomerResource($customer));
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        $this->authorize('update', $customer);
        $updated = $this->customerService->update($customer, $request->validated());
        return $this->success(new CustomerResource($updated));
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $this->authorize('delete', $customer);
        $this->customerService->delete($customer);
        return $this->noContent();
    }
}
