<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\AssignEmployeesRequest;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Requests\Booking\UpdateBookingStatusRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Services\BookingService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly BookingService $bookingService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Booking::class);
        $filters = $request->all();

        // Employees see only bookings assigned to them
        /** @var \App\Models\User $user */
        $user = $request->user();
        if ($user->hasRole('employee') && $user->employee) {
            $filters['employee_id'] = $user->employee->id;
        }

        $paginator = $this->bookingService->paginate($filters);
        return $this->paginated(BookingResource::collection($paginator));
    }

    public function show(Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);
        $booking->load(['customer.user', 'vehicle', 'service', 'station', 'coupon', 'employees.user', 'payment', 'qualityCheck', 'photos']);
        return $this->success(new BookingResource($booking));
    }

    public function fullyBookedDates(Request $request): JsonResponse
    {
        $request->validate([
            'station_id' => 'required|integer',
            'from'       => 'required|date',
            'to'         => 'required|date|after_or_equal:from',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        $companyId = $user->company_id;
        $stationId = (int) $request->query('station_id');
        $from      = $request->query('from');
        $to        = $request->query('to');

        $bookings = \App\Models\Booking::where('company_id', $companyId)
            ->where('station_id', $stationId)
            ->whereDate('booking_date', '>=', $from)
            ->whereDate('booking_date', '<=', $to)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->get(['booking_date', 'booking_time']);

        $slotsPerDay = 20; // 08:00–17:30 at 30min intervals

        $countByDate = [];
        foreach ($bookings as $b) {
            $date = $b->booking_date instanceof \Carbon\Carbon
                ? $b->booking_date->format('Y-m-d')
                : date('Y-m-d', strtotime((string) $b->booking_date));
            $countByDate[$date] = ($countByDate[$date] ?? 0) + 1;
        }

        $fullyBooked = [];
        foreach ($countByDate as $date => $count) {
            if ($count >= $slotsPerDay) {
                $fullyBooked[] = $date;
            }
        }

        return $this->success([
            'fully_booked_dates' => $fullyBooked,
        ]);
    }

    public function availability(Request $request): JsonResponse
    {
        $request->validate([
            'date'       => 'required|date',
            'station_id' => 'required|integer',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        $companyId = $user->company_id;

        $date      = $request->query('date');
        $stationId = (int) $request->query('station_id');

        $bookings = \App\Models\Booking::where('company_id', $companyId)
            ->whereDate('booking_date', $date)
            ->where('station_id', $stationId)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->get();

        $countBySlot = [];
        foreach ($bookings as $booking) {
            $raw  = $booking->booking_time;
            $time = is_object($raw) ? $raw->format('H:i') : substr((string) $raw, 0, 5);
            $countBySlot[$time] = ($countBySlot[$time] ?? 0) + 1;
        }

        $fullSlots = [];
        foreach ($countBySlot as $time => $count) {
            if ($count >= 1) {
                $fullSlots[] = $time;
            }
        }

        return $this->success([
            'full_slots' => array_values($fullSlots),
            'date'       => $date,
        ]);
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $this->authorize('create', Booking::class);
        /** @var \App\Models\User $authUser */
        $authUser = request()->user();
        $booking = $this->bookingService->create($request->validated(), $authUser);
        return $this->created(new BookingResource($booking->load(['customer', 'vehicle', 'service'])));
    }

    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('updateStatus', $booking);
        $updated = $this->bookingService->updateStatus($booking, $request->validated('status'));
        return $this->success(new BookingResource($updated));
    }

    public function assignEmployees(AssignEmployeesRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('assignEmployees', $booking);
        $updated = $this->bookingService->assignEmployees($booking, $request->validated('employee_ids'));
        return $this->success(new BookingResource($updated->load('employees.user')));
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('cancel', $booking);
        $request->validate(['reason' => 'nullable|string|max:500']);
        $updated = $this->bookingService->cancel($booking, $request->reason);
        return $this->success(new BookingResource($updated));
    }
}
