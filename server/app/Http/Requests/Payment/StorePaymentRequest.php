<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'booking_id'            => 'required|exists:bookings,id',
            'amount'                => 'sometimes|numeric|min:0',
            'payment_method'        => 'required|in:cash,card,transfer,wallet',
            'transaction_reference' => 'nullable|string|max:255|unique:payments,transaction_reference',
            'notes'                 => 'nullable|string|max:500',
        ];
    }
}
