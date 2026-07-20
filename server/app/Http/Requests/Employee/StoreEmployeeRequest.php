<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'          => 'required|string|max:150',
            'email'         => 'required|email|max:255|unique:users,email',
            'phone'         => 'nullable|string|max:30',
            'password'      => ['required', Password::defaults()],
            'station_id'    => 'nullable|exists:stations,id',
            'employee_code' => 'nullable|string|max:50|unique:employees,employee_code',
            'hire_date'     => 'nullable|date',
            'salary'        => 'nullable|numeric|min:0',
        ];
    }
}
