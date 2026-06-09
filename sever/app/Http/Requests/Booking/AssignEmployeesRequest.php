<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class AssignEmployeesRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_ids'   => 'required|array|min:1',
            'employee_ids.*' => 'exists:employees,id',
        ];
    }
}
