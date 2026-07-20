<?php

namespace App\Http\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'             => 'sometimes|string|max:150',
            'category'         => 'nullable|string|in:full,interior,exterior,premium',
            'description'      => 'sometimes|nullable|string',
            'price'            => 'sometimes|numeric|min:0',
            'duration_minutes' => 'sometimes|integer|min:1',
            'options'          => 'nullable|array',
            'options.*'        => 'string',
            'is_active'        => 'sometimes|boolean',
        ];
    }
}
