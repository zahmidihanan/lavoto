<?php

namespace App\Http\Requests\Vehicle;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'customer_id'  => 'nullable|exists:customers,id',
            'brand'        => 'required|string|max:100',
            'model'        => 'required|string|max:100',
            'year'         => 'nullable|integer|between:1900,2100',
            'color'        => 'nullable|string|max:50',
            'plate_number' => 'required|string|max:20',
        ];
    }
}
