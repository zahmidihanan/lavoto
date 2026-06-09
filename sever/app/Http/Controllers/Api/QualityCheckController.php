<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\QualityCheck\StoreQualityCheckRequest;
use App\Http\Resources\QualityCheckResource;
use App\Models\Booking;
use App\Models\QualityCheck;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class QualityCheckController extends Controller
{
    use ApiResponse;

    public function store(StoreQualityCheckRequest $request): JsonResponse
    {
        $booking = Booking::findOrFail($request->validated('booking_id'));

        $check = QualityCheck::create([
            'booking_id'  => $booking->id,
            'employee_id' => auth()->user()->employee?->id,
            'notes'       => $request->validated('notes'),
            'passed'      => $request->validated('passed'),
            'rating'      => $request->validated('rating'),
        ]);

        if ($check->passed) {
            $booking->update(['status' => 'completed']);
        }

        return $this->created(new QualityCheckResource($check->load('employee.user')));
    }

    public function show(QualityCheck $qualityCheck): JsonResponse
    {
        $qualityCheck->load(['booking', 'employee.user']);
        return $this->success(new QualityCheckResource($qualityCheck));
    }
}
