<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'category'         => $this->category,
            'description'      => $this->description,
            'price'            => $this->price,
            'duration_minutes' => $this->duration_minutes,
            'options'          => $this->options,
            'is_active'        => $this->is_active,
            'company_id'       => $this->company_id,
            'created_at'       => $this->created_at,
        ];
    }
}
