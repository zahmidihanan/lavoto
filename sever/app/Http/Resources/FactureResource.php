<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FactureResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reservation_id' => $this->reservation_id,
            'numero_facture' => $this->numero_facture,
            'client' => new UserResource($this->whenLoaded('client')),
            'montant_ht' => $this->montant_ht,
            'taux_tva' => $this->taux_tva,
            'montant_tva' => round($this->montant_ht * $this->taux_tva / 100, 2),
            'montant_ttc' => $this->montant_ttc,
            'frais_deplacement' => $this->frais_deplacement,
            'montant_paye' => $this->whenLoaded('paiements', fn() => $this->montant_paye),
            'reste_a_payer' => $this->whenLoaded('paiements', fn() => $this->reste_a_payer),
            'date_facture' => $this->date_facture,
            'date_echeance' => $this->date_echeance,
            'statut_paiement' => $this->statut_paiement,
            'paiements' => PaiementResource::collection($this->whenLoaded('paiements')),
            'created_at' => $this->created_at,
        ];
    }
}