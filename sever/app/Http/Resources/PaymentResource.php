<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'booking_id'            => $this->booking_id,
            'amount'                => $this->amount,
            'payment_method'        => $this->payment_method,
            'payment_status'        => $this->payment_status,
            'transaction_reference' => $this->transaction_reference,
            'notes'                 => $this->notes,
            'paid_at'               => $this->paid_at,
            'booking'               => new BookingResource($this->whenLoaded('booking')),
            'created_at'            => $this->created_at,
        ];
    }
}
