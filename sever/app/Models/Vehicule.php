<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type_vehicule_id',
        'marque',
        'modele',
        'annee',
        'immatriculation',
        'couleur',
        'kilometrage',
        'commentaire',
    ];

    protected $casts = [
        'annee' => 'integer',
        'kilometrage' => 'integer',
    ];

    // ===== ACCESSEURS =====
    public function getLibelleCompletAttribute(): string
    {
        return "{$this->marque} {$this->modele} ({$this->immatriculation})";
    }

    // ===== RELATIONS =====
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function typeVehicule(): BelongsTo
    {
        return $this->belongsTo(TypeVehicule::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    // ===== SCOPES =====
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByType($query, int $typeId)
    {
        return $query->where('type_vehicule_id', $typeId);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where('immatriculation', 'LIKE', "%{$term}%")
            ->orWhere('marque', 'LIKE', "%{$term}%")
            ->orWhere('modele', 'LIKE', "%{$term}%");
    }
}