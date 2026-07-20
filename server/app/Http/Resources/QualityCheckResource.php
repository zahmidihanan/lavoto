<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QualityCheckResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'booking_id'  => $this->booking_id,
            'employee_id' => $this->employee_id,
            'notes'       => $this->notes,
            'passed'      => $this->passed,
            'rating'      => $this->rating,
            'employee'    => new EmployeeResource($this->whenLoaded('employee')),
            'created_at'  => $this->created_at,
        ];
    }
}
