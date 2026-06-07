<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReservationStatutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'statut' => 'required|in:confirme,en_route,en_cours,termine,annule',
            'employe_id' => 'nullable|exists:users,id',
            'commentaire' => 'nullable|string',
            'localisation_employe' => 'nullable|string|max:255',
        ];
    }
}