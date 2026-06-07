<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AvisClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reservation_id' => $this->reservation_id,
            'client' => [
                'id' => $this->client?->id,
                'nom' => $this->client?->full_name,
            ],
            'employe' => [
                'id' => $this->employe?->id,
                'nom' => $this->employe?->full_name,
            ],
            'note' => $this->note,
            'commentaire' => $this->commentaire,
            'recommande' => $this->recommande,
            'statut' => $this->statut,
            'created_at' => $this->created_at,
        ];
    }
}