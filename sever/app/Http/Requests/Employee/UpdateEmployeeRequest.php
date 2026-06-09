<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $employeeId = $this->route('employee')?->id;

        return [
            'name'          => 'sometimes|string|max:150',
            'phone'         => 'sometimes|nullable|string|max:30',
            'password'      => ['sometimes', Password::defaults()],
            'station_id'    => 'sometimes|nullable|exists:stations,id',
            'employee_code' => "sometimes|string|max:50|unique:employees,employee_code,{$employeeId}",
            'hire_date'     => 'sometimes|date',
            'salary'        => 'sometimes|nullable|numeric|min:0',
            'status'        => 'sometimes|in:active,inactive,suspended',
        ];
    }
}
