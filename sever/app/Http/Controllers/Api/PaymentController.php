<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\PaymentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly PaymentService $paymentService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Payment::class);
        $paginator = $this->paymentService->paginate($request->all());
        return $this->paginated(PaymentResource::collection($paginator));
    }

    public function show(Payment $payment): JsonResponse
    {
        $this->authorize('view', $payment);
        $payment->load('booking');
        return $this->success(new PaymentResource($payment));
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $this->authorize('create', Payment::class);
        $booking = Booking::findOrFail($request->validated('booking_id'));
        $payment = $this->paymentService->createForBooking($booking, $request->validated());
        return $this->created(new PaymentResource($payment->load('booking')));
    }

    public function refund(Payment $payment): JsonResponse
    {
        $this->authorize('refund', $payment);
        $refunded = $this->paymentService->refund($payment);
        return $this->success(new PaymentResource($refunded));
    }
}
