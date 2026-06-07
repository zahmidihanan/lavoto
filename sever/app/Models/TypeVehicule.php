<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeVehicule extends Model
{
    use HasFactory;

    protected $table = 'types_vehicules';

    protected $fillable = [
        'nom',
    ];

    // ===== RELATIONS =====
    public function vehicules(): HasMany
    {
        return $this->hasMany(Vehicule::class, 'type_vehicule_id');
    }
}