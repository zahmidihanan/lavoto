<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'brand'        => $this->brand,
            'model'        => $this->model,
            'year'         => $this->year,
            'color'        => $this->color,
            'plate_number' => $this->plate_number,
            'company_id'   => $this->company_id,
            'customer_id'  => $this->customer_id,
            'customer'     => new CustomerResource($this->whenLoaded('customer')),
            'created_at'   => $this->created_at,
        ];
    }
}
