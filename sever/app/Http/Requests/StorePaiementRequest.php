<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaiementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'facture_id' => 'required|exists:factures,id',
            'montant' => 'required|numeric|min:0.01',
            'mode_paiement' => 'required|in:espece,carte,cheque,virement,en_ligne',
        ];
    }

    public function messages(): array
    {
        return [
            'montant.min' => 'Le montant doit être supérieur à 0.',
            'mode_paiement.in' => 'Le mode de paiement est invalide.',
        ];
    }
}