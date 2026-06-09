<?php

namespace App\Http\Requests\Station;

use Illuminate\Foundation\Http\FormRequest;

class StoreStationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'    => 'required|string|max:150',
            'address' => 'nullable|string|max:500',
            'city'    => 'nullable|string|max:100',
            'phone'   => 'nullable|string|max:30',
            'status'  => 'in:active,inactive,suspended',
        ];
    }
}
