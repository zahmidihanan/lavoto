<?php

namespace App\Repositories\Contracts;

use App\Models\Payment;
use Illuminate\Pagination\LengthAwarePaginator;

interface PaymentRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;
    public function findById(int $id, array $relations = []): ?Payment;
    public function findByBooking(int $bookingId): ?Payment;
    public function create(array $data): Payment;
    public function update(Payment $payment, array $data): Payment;
    public function delete(Payment $payment): bool;
}
