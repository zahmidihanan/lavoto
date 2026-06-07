<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehiculeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type_vehicule_id' => 'required|exists:types_vehicules,id',
            'marque' => 'required|string|max:100',
            'modele' => 'required|string|max:100',
            'annee' => 'nullable|integer|between:1900,' . (date('Y') + 1),
            'immatriculation' => 'required|string|max:20|unique:vehicules,immatriculation',
            'couleur' => 'nullable|string|max:50',
            'kilometrage' => 'nullable|integer|min:0',
            'commentaire' => 'nullable|string',
        ];
    }
}