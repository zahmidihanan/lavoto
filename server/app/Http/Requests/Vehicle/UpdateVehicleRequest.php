<?php

namespace App\Http\Requests\Vehicle;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'brand'        => 'sometimes|string|max:100',
            'model'        => 'sometimes|string|max:100',
            'year'         => 'sometimes|nullable|integer|between:1900,2100',
            'color'        => 'sometimes|nullable|string|max:50',
            'plate_number' => 'sometimes|string|max:20',
        ];
    }
}
