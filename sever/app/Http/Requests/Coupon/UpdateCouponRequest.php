<?php

namespace App\Http\Requests\Coupon;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCouponRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'value'      => 'sometimes|numeric|min:0',
            'min_amount' => 'sometimes|nullable|numeric|min:0',
            'max_uses'   => 'sometimes|nullable|integer|min:1',
            'expires_at' => 'sometimes|nullable|date',
            'is_active'  => 'sometimes|boolean',
        ];
    }
}
