<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_id' => 'required|exists:services,id',
            'vehicule_id' => 'required|exists:vehicules,id',
            'date_debut' => 'required|date|after:now',
            'adresse' => 'required|string|max:255',
            'ville' => 'required|string|max:100',
            'gps' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'date_debut.after' => 'La date de début doit être dans le futur.',
            'vehicule_id.exists' => 'Le véhicule sélectionné n\'existe pas.',
            'service_id.exists' => 'Le service sélectionné n\'existe pas.',
        ];
    }
}