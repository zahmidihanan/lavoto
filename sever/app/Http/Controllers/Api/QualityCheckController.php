<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\QualityCheck\StoreQualityCheckRequest;
use App\Http\Resources\QualityCheckResource;
use App\Models\Booking;
use App\Models\QualityCheck;
use App\Services\BookingService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class QualityCheckController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly BookingService $bookingService) {}

    public function store(StoreQualityCheckRequest $request): JsonResponse
    {
        $booking = Booking::findOrFail($request->validated('booking_id'));

        /** @var \App\Models\User $authUser */
        $authUser = \Illuminate\Support\Facades\Auth::user();

        $check = QualityCheck::create([
            'booking_id'  => $booking->id,
            'employee_id' => $authUser->employee?->id,
            'notes'       => $request->validated('notes'),
            'passed'      => $request->validated('passed'),
            'rating'      => $request->validated('rating'),
        ]);

        if ($check->passed) {
            $this->bookingService->updateStatus($booking, 'completed');
        }

        return $this->created(new QualityCheckResource($check->load('employee.user')));
    }

    public function show(QualityCheck $qualityCheck): JsonResponse
    {
        $qualityCheck->load(['booking', 'employee.user']);
        return $this->success(new QualityCheckResource($qualityCheck));
    }
}
