<?php

namespace App\Repositories;

use App\Models\Payment;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class PaymentRepository extends BaseRepository implements PaymentRepositoryInterface
{
    public function __construct() { parent::__construct(new Payment()); }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Payment::query()->with('booking.customer.user');

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }
        if (!empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        return $this->paginateQuery($this->applyFilters($query, $filters), $filters);
    }

    public function findById(int $id, array $relations = []): ?Payment
    {
        return Payment::with($relations ?: ['booking'])->find($id);
    }

    public function findByBooking(int $bookingId): ?Payment
    {
        return Payment::where('booking_id', $bookingId)->first();
    }

    public function create(array $data): Payment { return Payment::create($data); }

    public function update(Payment|\Illuminate\Database\Eloquent\Model $payment, array $data): Payment
    {
        $payment->update($data);
        return $payment->fresh();
    }
}
