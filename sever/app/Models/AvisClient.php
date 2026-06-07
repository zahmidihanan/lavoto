<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvisClient extends Model
{
    use HasFactory;

    protected $table = 'avis_clients';

    protected $fillable = [
        'reservation_id',
        'client_id',
        'employe_id',
        'note',
        'commentaire',
        'recommande',
        'statut',
    ];

    protected $casts = [
        'note' => 'integer',
        'recommande' => 'boolean',
    ];

    // ===== RELATIONS =====
    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function employe(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employe_id');
    }

    // ===== SCOPES =====
    public function scopeApprouves($query)
    {
        return $query->where('statut', 'approuve');
    }

    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    public function scopeByEmploye($query, int $employeId)
    {
        return $query->where('employe_id', $employeId);
    }
}