<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\Payment;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $period = $request->query('period', 'month');
        $startDate = match ($period) {
            'week'  => now()->startOfWeek(),
            'year'  => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        $bookings = Booking::query()
            ->where('created_at', '>=', $startDate)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $revenue = Payment::query()
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->sum('amount');

        $totalCustomers = Customer::count();
        $totalEmployees = Employee::count();

        $recentBookings = Booking::query()
            ->with(['customer.user', 'service', 'vehicle'])
            ->latest()
            ->limit(5)
            ->get();

        return $this->success([
            'bookings_by_status' => $bookings,
            'revenue'            => $revenue,
            'total_customers'    => $totalCustomers,
            'total_employees'    => $totalEmployees,
            'period'             => $period,
            'recent_bookings'    => $recentBookings->map(fn($b) => [
                'id'           => $b->id,
                'status'       => $b->status,
                'booking_date' => $b->booking_date,
                'total_amount' => $b->total_amount,
                'customer'     => $b->customer?->user?->name,
                'service'      => $b->service?->name,
                'vehicle'      => $b->vehicle ? "{$b->vehicle->brand} {$b->vehicle->model}" : null,
            ]),
        ]);
    }
}
