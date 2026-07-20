<?php

namespace App\Repositories\Contracts;

use App\Models\Booking;
use Illuminate\Pagination\LengthAwarePaginator;

interface BookingRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;
    public function findById(int $id, array $relations = []): ?Booking;
    public function create(array $data): Booking;
    public function update(Booking $booking, array $data): Booking;
    public function updateStatus(Booking $booking, string $status, array $extra = []): Booking;
    public function delete(Booking $booking): bool;
    public function assignEmployees(Booking $booking, array $employeeIds): void;
}
