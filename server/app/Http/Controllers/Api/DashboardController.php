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

        /** @var \App\Models\User $user */
        $user = $request->user();
        $companyId = $user->company_id;

        $companyFilter = fn($q) => $companyId
            ? $q->where('company_id', $companyId)
            : $q;

        $bookings = Booking::query()
            ->where('created_at', '>=', $startDate)
            ->where($companyFilter)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $revenue = Payment::query()
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->whereHas('booking', fn($q) =>
                $q->where($companyFilter)
            )
            ->sum('amount');

        $totalCustomers = Customer::where($companyFilter)->count();
        $totalEmployees = Employee::where($companyFilter)->count();

        $recentBookings = Booking::query()
            ->with(['customer.user', 'service', 'vehicle', 'payment'])
            ->where($companyFilter)
            ->latest()
            ->limit(10)
            ->get();

        return $this->success([
            'bookings_by_status' => $bookings,
            'revenue'            => [
                'total'  => (float) $revenue,
                'period' => 0,
            ],
            'total_customers'    => $totalCustomers,
            'total_employees'    => $totalEmployees,
            'period'             => $period,
            'recent_bookings'    => $recentBookings->map(fn($b) => [
                'id'           => $b->id,
                'customer_id'  => $b->customer_id,
                'status'       => $b->status,
                'booking_date' => $b->booking_date,
                'total_amount' => $b->total_amount,
                'customer'     => $b->customer ? [
                    'id'   => $b->customer->id,
                    'user' => $b->customer->user ? [
                        'id'   => $b->customer->user->id,
                        'name' => $b->customer->user->name,
                    ] : null,
                ] : null,
                'service'      => $b->service ? [
                    'id'   => $b->service->id,
                    'name' => $b->service->name,
                ] : null,
                'vehicle'      => $b->vehicle ? [
                    'id'    => $b->vehicle->id,
                    'brand' => $b->vehicle->brand,
                    'model' => $b->vehicle->model,
                ] : null,
                'payment'      => $b->payment ? ['id' => $b->payment->id] : null,
            ]),
        ]);
    }
}
