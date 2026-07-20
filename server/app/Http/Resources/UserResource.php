<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'email'             => $this->email,
            'phone'             => $this->phone,
            'status'            => $this->status,
            'company_id'        => $this->company_id,
            'station_id'        => $this->station_id,
            'email_verified_at' => $this->email_verified_at,
            'last_login_at'     => $this->last_login_at,
            'roles'             => $this->whenLoaded('roles', fn() => $this->getRoleNames()),
            'permissions'       => $this->whenLoaded('permissions', fn() => $this->getAllPermissions()->pluck('name')),
            'station'           => new StationResource($this->whenLoaded('station')),
            'created_at'        => $this->created_at,
        ];
    }
}
