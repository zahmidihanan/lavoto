<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'address'    => $this->address,
            'city'       => $this->city,
            'phone'      => $this->phone,
            'status'     => $this->status,
            'company_id' => $this->company_id,
            'created_at' => $this->created_at,
        ];
    }
}
