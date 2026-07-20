<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Coupon;
use App\Repositories\Contracts\CouponRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class CouponService
{
    public function __construct(
        private readonly CouponRepositoryInterface $couponRepo,
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->couponRepo->paginate($filters);
    }

    public function findOrFail(int $id): Coupon
    {
        $coupon = $this->couponRepo->findById($id);
        if (! $coupon) throw new ApiException('Coupon not found.', 404);
        return $coupon;
    }

    public function validate(string $code, float $amount): Coupon
    {
        $coupon = $this->couponRepo->findByCode($code);

        if (! $coupon || ! $coupon->isValid($amount)) {
            throw new ApiException('Coupon is invalid, expired, or does not meet the minimum amount.', 422);
        }

        return $coupon;
    }

    public function create(array $data): Coupon
    {
        return $this->couponRepo->create($data);
    }

    public function update(Coupon $coupon, array $data): Coupon
    {
        return $this->couponRepo->update($coupon, $data);
    }

    public function delete(Coupon $coupon): void
    {
        if ($coupon->used_count > 0) {
            throw new ApiException('Cannot delete a coupon that has already been used.', 422);
        }
        $this->couponRepo->delete($coupon);
    }
}
