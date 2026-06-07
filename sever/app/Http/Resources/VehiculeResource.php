<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehiculeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'marque' => $this->marque,
            'modele' => $this->modele,
            'libelle_complet' => $this->libelle_complet,
            'annee' => $this->annee,
            'immatriculation' => $this->immatriculation,
            'couleur' => $this->couleur,
            'kilometrage' => $this->kilometrage,
            'commentaire' => $this->commentaire,
            'type_vehicule' => [
                'id' => $this->typeVehicule?->id,
                'nom' => $this->typeVehicule?->nom,
            ],
            'proprietaire' => [
                'id' => $this->user?->id,
                'nom' => $this->user?->full_name,
            ],
            'created_at' => $this->created_at,
        ];
    }
}