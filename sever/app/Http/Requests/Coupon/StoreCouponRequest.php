<?php

namespace App\Http\Requests\Coupon;

use Illuminate\Foundation\Http\FormRequest;

class StoreCouponRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'code'       => 'required|string|max:50',
            'type'       => 'required|in:fixed,percentage',
            'value'      => 'required|numeric|min:0',
            'min_amount' => 'nullable|numeric|min:0',
            'max_uses'   => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date|after:today',
            'is_active'  => 'boolean',
        ];
    }
}
