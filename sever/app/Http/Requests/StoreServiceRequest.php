<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'required|string|max:100',
            'categorie' => 'required|in:lavage,nettoyage,polissage,entretien',
            'description' => 'nullable|string',
            'duree_estimee' => 'required|date_format:H:i',
            'prix_base' => 'required|numeric|min:0|max:9999.99',
            'statut' => 'sometimes|in:disponible,indisponible',
        ];
    }
}