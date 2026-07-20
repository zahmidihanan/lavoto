<?php

namespace App\Repositories\Contracts;

use App\Models\Coupon;
use Illuminate\Pagination\LengthAwarePaginator;

interface CouponRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;
    public function findById(int $id): ?Coupon;
    public function findByCode(string $code): ?Coupon;
    public function create(array $data): Coupon;
    public function update(Coupon $coupon, array $data): Coupon;
    public function delete(Coupon $coupon): bool;
    public function incrementUsage(Coupon $coupon): void;
}
