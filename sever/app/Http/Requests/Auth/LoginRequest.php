<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:6',
            'device_name' => 'string|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'L\'email est obligatoire.',
            'email.email' => 'L\'email doit être valide.',
            'email.exists' => 'Aucun compte avec cet email.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min' => 'Le mot de passe doit faire au moins 6 caractères.',
        ];
    }
}