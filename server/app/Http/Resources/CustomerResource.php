<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'address'        => $this->address,
            'loyalty_points' => $this->loyalty_points,
            'company_id'     => $this->company_id,
            'user'           => new UserResource($this->whenLoaded('user')),
            'vehicles'       => VehicleResource::collection($this->whenLoaded('vehicles')),
            'created_at'     => $this->created_at,
        ];
    }
}
