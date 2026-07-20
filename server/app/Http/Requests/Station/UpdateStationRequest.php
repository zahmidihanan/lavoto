<?php

namespace App\Http\Requests\Station;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'    => 'sometimes|string|max:150',
            'address' => 'sometimes|nullable|string|max:500',
            'city'    => 'sometimes|nullable|string|max:100',
            'phone'   => 'sometimes|nullable|string|max:30',
            'status'  => 'sometimes|in:active,inactive,suspended',
        ];
    }
}
