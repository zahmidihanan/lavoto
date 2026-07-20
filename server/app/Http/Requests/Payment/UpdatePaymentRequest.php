<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $paymentId = $this->route('payment');

        return [
            'amount'                => 'sometimes|numeric|min:0',
            'payment_method'        => 'sometimes|in:cash,card,transfer,wallet',
            'payment_status'        => 'sometimes|in:pending,paid,failed,refunded',
            'transaction_reference' => 'nullable|string|max:255|unique:payments,transaction_reference,' . $paymentId,
            'notes'                 => 'nullable|string|max:500',
            'paid_at'               => 'nullable|date',
        ];
    }
}
