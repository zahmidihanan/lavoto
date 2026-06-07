<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAvisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reservation_id' => 'required|exists:reservations,id',
            'note' => 'required|integer|between:1,5',
            'commentaire' => 'nullable|string',
            'recommande' => 'sometimes|boolean',
        ];
    }
}