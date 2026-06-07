<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVehiculeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type_vehicule_id' => 'sometimes|exists:types_vehicules,id',
            'marque' => 'sometimes|string|max:100',
            'modele' => 'sometimes|string|max:100',
            'annee' => 'nullable|integer|between:1900,' . (date('Y') + 1),
            'immatriculation' => 'sometimes|string|max:20|unique:vehicules,immatriculation,' . $this->vehicule,
            'couleur' => 'nullable|string|max:50',
            'kilometrage' => 'nullable|integer|min:0',
            'commentaire' => 'nullable|string',
        ];
    }
}