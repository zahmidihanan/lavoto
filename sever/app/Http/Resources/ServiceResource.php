<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'categorie' => $this->categorie,
            'description' => $this->description,
            'duree_estimee' => $this->duree_estimee,
            'prix_base' => $this->prix_base,
            'statut' => $this->statut,
            'created_at' => $this->created_at,
        ];
    }
}