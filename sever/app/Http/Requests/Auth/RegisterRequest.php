<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'company_name' => 'required|string|max:150',
            'name'         => 'required|string|max:150',
            'email'        => 'required|email|max:255|unique:users,email',
            'phone'        => 'nullable|string|max:30',
            'password'     => ['required', 'confirmed', Password::defaults()],
        ];
    }
}
