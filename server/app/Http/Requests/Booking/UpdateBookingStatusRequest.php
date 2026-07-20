<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingStatusRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status'               => 'required|in:pending,confirmed,assigned,in_progress,quality_check,completed,cancelled',
            'cancellation_reason'  => 'required_if:status,cancelled|nullable|string|max:500',
        ];
    }
}
