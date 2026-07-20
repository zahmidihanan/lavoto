<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'code'       => $this->code,
            'type'       => $this->type,
            'value'      => $this->value,
            'min_amount' => $this->min_amount,
            'max_uses'   => $this->max_uses,
            'used_count' => $this->used_count,
            'expires_at' => $this->expires_at,
            'is_active'  => $this->is_active,
            'company_id' => $this->company_id,
            'created_at' => $this->created_at,
        ];
    }
}
