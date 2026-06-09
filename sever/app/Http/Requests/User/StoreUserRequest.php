<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'       => 'required|string|max:150',
            'email'      => 'required|email|max:255|unique:users,email',
            'phone'      => 'nullable|string|max:30',
            'password'   => ['required', Password::defaults()],
            'station_id' => 'nullable|exists:stations,id',
            'status'     => 'in:active,inactive,suspended',
            'role'       => 'required|in:admin,employee,customer',
        ];
    }
}
