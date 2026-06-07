<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeAbonnement extends Model
{
    use HasFactory;

    protected $table = 'types_abonnements';

    protected $fillable = [
        'nom',
        'prix',
        'duree_mois',
    ];

    protected $casts = [
        'prix' => 'decimal:2',
    ];

    // ===== RELATIONS =====
    public function abonnements(): HasMany
    {
        return $this->hasMany(Abonnement::class, 'type_abonnement_id');
    }
}