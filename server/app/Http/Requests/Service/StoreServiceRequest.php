<?php

namespace App\Http\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'             => 'required|string|max:150',
            'category'         => 'nullable|string|in:full,interior,exterior,premium',
            'description'      => 'nullable|string',
            'price'            => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'options'          => 'nullable|array',
            'options.*'        => 'string',
            'is_active'        => 'boolean',
        ];
    }
}
