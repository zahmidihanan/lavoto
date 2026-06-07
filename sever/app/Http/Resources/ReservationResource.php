<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client' => new UserResource($this->whenLoaded('client')),
            'employe' => new UserResource($this->whenLoaded('employe')),
            'service' => new ServiceResource($this->whenLoaded('service')),
            'vehicule' => new VehiculeResource($this->whenLoaded('vehicule')),
            'date_debut' => $this->date_debut,
            'date_fin' => $this->date_fin,
            'adresse' => $this->adresse,
            'ville' => $this->ville,
            'gps' => $this->gps,
            'prix_estime' => $this->prix_estime,
            'statut' => $this->statut,
            'notes' => $this->notes,
            'facture' => new FactureResource($this->whenLoaded('facture')),
            'historiques' => ReservationHistoriqueResource::collection($this->whenLoaded('historiques')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}