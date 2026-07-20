<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $userId = auth()->id();

        return [
            'name'         => 'sometimes|string|max:150',
            'phone'        => 'sometimes|nullable|string|max:30',
            'password'     => ['sometimes', 'confirmed', Password::defaults()],
            'current_password' => 'required_with:password|string',
        ];
    }
}
