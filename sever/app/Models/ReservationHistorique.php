<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReservationHistorique extends Model
{
    use HasFactory;

    protected $table = 'reservation_historiques';

    public $timestamps = false;

    protected $fillable = [
        'reservation_id',
        'employe_id',
        'ancien_statut',
        'nouveau_statut',
        'localisation_employe',
        'commentaire',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // ===== RELATIONS =====
    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function employe(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}