<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'telephone' => $this->telephone,
            'role' => [
                'id' => $this->role?->id,
                'nom' => $this->role?->nom,
            ],
            'statut' => $this->statut,
            'email_verified_at' => $this->email_verified_at,
            'last_login_at' => $this->last_login_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}