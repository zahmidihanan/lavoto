<?php

namespace App\Repositories;

use App\Models\Booking;
use App\Repositories\Contracts\BookingRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class BookingRepository extends BaseRepository implements BookingRepositoryInterface
{
    public function __construct() { parent::__construct(new Booking()); }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Booking::query()->with([
            'customer.user', 'vehicle', 'service', 'station', 'payment', 'employees.user',
        ]);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }
        if (!empty($filters['station_id'])) {
            $query->where('station_id', $filters['station_id']);
        }
        if (!empty($filters['date_from'])) {
            $query->whereDate('booking_date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('booking_date', '<=', $filters['date_to']);
        }

        return $this->paginateQuery($this->applyFilters($query, $filters), $filters);
    }

    public function findById(int $id, array $relations = []): ?Booking
    {
        return Booking::with($relations ?: [
            'customer.user', 'vehicle', 'service', 'station', 'payment',
            'employees.user', 'vehiclePhotos', 'qualityCheck', 'coupon',
        ])->find($id);
    }

    public function create(array $data): Booking { return Booking::create($data); }

    public function update(Booking|\Illuminate\Database\Eloquent\Model $booking, array $data): Booking
    {
        $booking->update($data);
        return $booking->fresh();
    }

    public function updateStatus(Booking $booking, string $status, array $extra = []): Booking
    {
        $booking->update(array_merge(['status' => $status], $extra));
        return $booking->fresh();
    }

    public function delete(Booking|\Illuminate\Database\Eloquent\Model $booking): bool
    {
        return $booking->delete();
    }

    public function assignEmployees(Booking $booking, array $employeeIds): void
    {
        $booking->employees()->sync($employeeIds);
    }
}
