<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model
{
    use HasFactory;

    protected $fillable = [
        'facture_id',
        'client_id',
        'montant',
        'mode_paiement',
        'date_paiement',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date_paiement' => 'datetime',
    ];

    public static function getModes(): array
    {
        return ['espece', 'carte', 'cheque', 'virement', 'en_ligne'];
    }

    // ===== RELATIONS =====
    public function facture(): BelongsTo
    {
        return $this->belongsTo(Facture::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    // ===== ÉVÉNEMENTS =====
    protected static function booted(): void
    {
        static::created(function (Paiement $paiement) {
            $paiement->facture->verifierEtMettreAJourStatut();
        });
    }
}