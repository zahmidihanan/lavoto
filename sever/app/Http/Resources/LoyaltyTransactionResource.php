<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoyaltyTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'customer_id' => $this->customer_id,
            'booking_id'  => $this->booking_id,
            'points'      => $this->points,
            'type'        => $this->type,
            'description' => $this->description,
            'created_at'  => $this->created_at,
        ];
    }
}
