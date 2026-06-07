<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AbonnementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client' => [
                'id' => $this->client?->id,
                'nom' => $this->client?->full_name,
            ],
            'type_abonnement' => [
                'id' => $this->typeAbonnement?->id,
                'nom' => $this->typeAbonnement?->nom,
                'duree_mois' => $this->typeAbonnement?->duree_mois,
            ],
            'date_debut' => $this->date_debut,
            'date_fin' => $this->date_fin,
            'prix_paye' => $this->prix_paye,
            'statut' => $this->statut,
            'est_actif' => $this->estActif(),
            'created_at' => $this->created_at,
        ];
    }
}