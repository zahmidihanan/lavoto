<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Requests\Payment\UpdatePaymentRequest;
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

    public function update(UpdatePaymentRequest $request, Payment $payment): JsonResponse
    {
        $this->authorize('update', $payment);
        $updated = $this->paymentService->update($payment, $request->validated());
        return $this->success(new PaymentResource($updated));
    }

    public function destroy(Payment $payment): JsonResponse
    {
        $this->authorize('delete', $payment);
        $this->paymentService->delete($payment);
        return $this->success(null, 'Payment deleted successfully.');
    }

    public function refund(Payment $payment): JsonResponse
    {
        $this->authorize('refund', $payment);
        $refunded = $this->paymentService->refund($payment);
        return $this->success(new PaymentResource($refunded));
    }

    public function import(Request $request): JsonResponse
    {
        $this->authorize('create', Payment::class);
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file   = $request->file('file');
        $rows   = array_map('str_getcsv', file($file->getPathname()));
        $header = array_shift($rows);

        $mapped = [];
        foreach ($rows as $row) {
            $mapped[] = array_combine($header, $row);
        }

        $result = $this->paymentService->import($mapped);
        $message = "{$result['imported']} payment(s) imported.";

        if (! empty($result['errors'])) {
            $message .= ' Errors: ' . implode('; ', $result['errors']);
        }

        return $this->success($result, $message);
    }

    public function exportWord(Request $request): \Illuminate\Http\Response
    {
        $this->authorize('viewAny', Payment::class);
        return $this->paymentService->exportWord();
    }
}
