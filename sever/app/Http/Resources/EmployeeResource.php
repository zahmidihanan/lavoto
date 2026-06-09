<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'employee_code' => $this->employee_code,
            'hire_date'     => $this->hire_date,
            'salary'        => $this->salary,
            'company_id'    => $this->company_id,
            'station_id'    => $this->station_id,
            'user'          => new UserResource($this->whenLoaded('user')),
            'station'       => new StationResource($this->whenLoaded('station')),
            'created_at'    => $this->created_at,
        ];
    }
}
