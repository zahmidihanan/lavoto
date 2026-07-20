<?php

namespace App\Http\Requests\QualityCheck;

use Illuminate\Foundation\Http\FormRequest;

class StoreQualityCheckRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'booking_id'  => 'required|exists:bookings,id',
            'notes'       => 'nullable|string|max:1000',
            'passed'      => 'required|boolean',
            'rating'      => 'nullable|integer|between:1,5',
        ];
    }
}
