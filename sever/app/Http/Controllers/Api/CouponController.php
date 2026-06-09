<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Coupon\StoreCouponRequest;
use App\Http\Requests\Coupon\UpdateCouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use App\Services\CouponService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly CouponService $couponService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Coupon::class);
        $paginator = $this->couponService->paginate($request->all());
        return $this->paginated(CouponResource::collection($paginator));
    }

    public function show(Coupon $coupon): JsonResponse
    {
        $this->authorize('view', $coupon);
        return $this->success(new CouponResource($coupon));
    }

    public function store(StoreCouponRequest $request): JsonResponse
    {
        $this->authorize('create', Coupon::class);
        /** @var \App\Models\User $authUser */
        $authUser = $request->user();
        $data = array_merge($request->validated(), ['company_id' => $authUser->company_id]);
        $coupon = $this->couponService->create($data);
        return $this->created(new CouponResource($coupon));
    }

    public function update(UpdateCouponRequest $request, Coupon $coupon): JsonResponse
    {
        $this->authorize('update', $coupon);
        $updated = $this->couponService->update($coupon, $request->validated());
        return $this->success(new CouponResource($updated));
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $this->authorize('delete', $coupon);
        $this->couponService->delete($coupon);
        return $this->noContent();
    }

    public function validate(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string', 'amount' => 'required|numeric|min:0']);
        $code   = $request->input('code');
        $amount = (float) $request->input('amount');

        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon || !$coupon->isValid($amount)) {
            return $this->error('Coupon is invalid or not applicable.', 422);
        }

        return $this->success([
            'coupon'   => new CouponResource($coupon),
            'discount' => $coupon->calculateDiscount($amount),
        ]);
    }
}
