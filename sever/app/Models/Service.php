<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'categorie',
        'description',
        'duree_estimee',
        'prix_base',
        'statut',
    ];

    protected $casts = [
        'duree_estimee' => 'datetime:H:i',
        'prix_base' => 'decimal:2',
    ];

    // ===== RELATIONS =====
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    // ===== SCOPES =====
    public function scopeDisponibles($query)
    {
        return $query->where('statut', 'disponible');
    }

    public function scopeByCategorie($query, string $categorie)
    {
        return $query->where('categorie', $categorie);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where('nom', 'LIKE', "%{$term}%");
    }

    // ===== MÉTHODES =====
    public static function getCategories(): array
    {
        return ['lavage', 'nettoyage', 'polissage', 'entretien'];
    }
}