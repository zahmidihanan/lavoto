<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LoyaltyTransactionResource;
use App\Models\Customer;
use App\Services\LoyaltyService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly LoyaltyService $loyaltyService) {}

    public function transactions(Request $request, Customer $customer): JsonResponse
    {
        $paginator = $this->loyaltyService->transactions($customer, $request->all());
        return $this->paginated(LoyaltyTransactionResource::collection($paginator));
    }

    public function redeem(Request $request, Customer $customer): JsonResponse
    {
        $request->validate(['points' => 'required|integer|min:1']);

        $transaction = $this->loyaltyService->redeemPoints($customer, $request->integer('points'));
        return $this->created(new LoyaltyTransactionResource($transaction));
    }
}
