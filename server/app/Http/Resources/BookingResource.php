<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'status'              => $this->status,
            'booking_date'        => $this->booking_date,
            'booking_time'        => $this->booking_time,
            'total_amount'        => $this->total_amount,
            'discount_amount'     => $this->discount_amount,
            'notes'               => $this->notes,
            'cancellation_reason' => $this->cancellation_reason,
            'cancelled_at'        => $this->cancelled_at,
            'company_id'          => $this->company_id,
            'customer_id'         => $this->customer_id,
            'vehicle_id'          => $this->vehicle_id,
            'service_id'          => $this->service_id,
            'station_id'          => $this->station_id,
            'coupon_id'           => $this->coupon_id,
            'customer'            => new CustomerResource($this->whenLoaded('customer')),
            'vehicle'             => new VehicleResource($this->whenLoaded('vehicle')),
            'service'             => new ServiceResource($this->whenLoaded('service')),
            'station'             => new StationResource($this->whenLoaded('station')),
            'coupon'              => new CouponResource($this->whenLoaded('coupon')),
            'employees'           => EmployeeResource::collection($this->whenLoaded('employees')),
            'payment'             => new PaymentResource($this->whenLoaded('payment')),
            'quality_check'       => new QualityCheckResource($this->whenLoaded('qualityCheck')),
            'photos'              => $this->whenLoaded('photos', fn() => $this->photos->map(fn($p) => [
                'id'         => $p->id,
                'image_path' => $p->image_path,
                'type'       => $p->type,
                'caption'    => $p->caption,
            ])),
            'created_at'          => $this->created_at,
        ];
    }
}
