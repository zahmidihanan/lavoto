<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationHistoriqueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ancien_statut' => $this->ancien_statut,
            'nouveau_statut' => $this->nouveau_statut,
            'localisation_employe' => $this->localisation_employe,
            'commentaire' => $this->commentaire,
            'employe' => [
                'id' => $this->employe?->id,
                'nom' => $this->employe?->full_name,
            ],
            'created_at' => $this->created_at,
        ];
    }
}