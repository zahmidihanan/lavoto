<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user ?? $this->route('user');

        return [
            'nom' => 'sometimes|string|max:100',
            'prenom' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $userId,
            'telephone' => 'nullable|string|max:20',
            'statut' => 'sometimes|in:actif,inactif,conges',
            'role_id' => 'sometimes|exists:roles,id',
        ];
    }
}