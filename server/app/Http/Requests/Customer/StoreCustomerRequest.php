<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'     => 'required|string|max:150',
            'email'    => 'required|email|max:255|unique:users,email',
            'phone'    => 'nullable|string|max:30',
            'password' => ['required', Password::defaults()],
        ];
    }
}
