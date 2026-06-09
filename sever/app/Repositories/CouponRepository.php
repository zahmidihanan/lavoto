<?php

namespace App\Repositories;

use App\Models\Coupon;
use App\Repositories\Contracts\CouponRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class CouponRepository extends BaseRepository implements CouponRepositoryInterface
{
    public function __construct() { parent::__construct(new Coupon()); }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Coupon::query();

        if (isset($filters['is_active'])) {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        return $this->paginateQuery($this->applyFilters($query, $filters), $filters);
    }

    public function findById(int $id, array $relations = []): ?Coupon
    {
        return Coupon::with($relations)->find($id);
    }

    public function findByCode(string $code): ?Coupon
    {
        return Coupon::where('code', strtoupper($code))->first();
    }

    public function create(array $data): Coupon
    {
        $data['code'] = strtoupper($data['code']);
        return Coupon::create($data);
    }

    public function update(Coupon|\Illuminate\Database\Eloquent\Model $coupon, array $data): Coupon
    {
        if (isset($data['code'])) $data['code'] = strtoupper($data['code']);
        $coupon->update($data);
        return $coupon->fresh();
    }

    public function delete(Coupon|\Illuminate\Database\Eloquent\Model $coupon): bool
    {
        return $coupon->delete();
    }

    public function incrementUsage(Coupon $coupon): void
    {
        $coupon->increment('used_count');
    }
}
