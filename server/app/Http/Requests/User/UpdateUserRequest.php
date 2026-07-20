<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'name'       => 'sometimes|string|max:150',
            'email'      => "sometimes|email|max:255|unique:users,email,{$userId}",
            'phone'      => 'sometimes|nullable|string|max:30',
            'password'   => ['sometimes', Password::defaults()],
            'station_id' => 'sometimes|nullable|exists:stations,id',
            'status'     => 'sometimes|in:active,inactive,suspended',
        ];
    }
}
