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
        $paginator = $this->bookingService->paginate($request->all());
        return $this->paginated(BookingResource::collection($paginator));
    }

    public function show(Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);
        $booking->load(['customer.user', 'vehicle', 'service', 'station', 'coupon', 'employees.user', 'payment', 'qualityCheck', 'photos']);
        return $this->success(new BookingResource($booking));
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $this->authorize('create', Booking::class);
        $booking = $this->bookingService->create($request->validated(), auth()->user());
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
