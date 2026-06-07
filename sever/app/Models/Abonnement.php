<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Abonnement extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'type_abonnement_id',
        'date_debut',
        'date_fin',
        'prix_paye',
        'statut',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'prix_paye' => 'decimal:2',
    ];

    // ===== RELATIONS =====
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function typeAbonnement(): BelongsTo
    {
        return $this->belongsTo(TypeAbonnement::class);
    }

    // ===== SCOPES =====
    public function scopeActifs($query)
    {
        return $query->where('statut', 'actif')
            ->where('date_fin', '>=', today());
    }

    public function scopeExpires($query)
    {
        return $query->where('statut', 'actif')
            ->whereBetween('date_fin', [today(), today()->addDays(7)]);
    }

    // ===== MÉTHODES =====
    public function estActif(): bool
    {
        return $this->statut === 'actif' && $this->date_fin >= today();
    }

    public function estExpire(): bool
    {
        return $this->date_fin < today();
    }
}