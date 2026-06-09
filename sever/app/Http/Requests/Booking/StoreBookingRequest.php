<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'vehicle_id'   => 'required|exists:vehicles,id',
            'service_id'   => 'required|exists:services,id',
            'station_id'   => 'nullable|exists:stations,id',
            'coupon_code'  => 'nullable|string|max:50',
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required|date_format:H:i',
            'notes'        => 'nullable|string|max:1000',
        ];
    }
}
