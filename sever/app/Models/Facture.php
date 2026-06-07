<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Facture extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'client_id',
        'numero_facture',
        'montant_ht',
        'taux_tva',
        'montant_ttc',
        'frais_deplacement',
        'date_facture',
        'date_echeance',
        'statut_paiement',
    ];

    protected $casts = [
        'montant_ht' => 'decimal:2',
        'taux_tva' => 'decimal:2',
        'montant_ttc' => 'decimal:2',
        'frais_deplacement' => 'decimal:2',
        'date_facture' => 'date',
        'date_echeance' => 'date',
    ];

    // ===== CONSTANCES =====
    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_PARTIEL = 'partiel';
    public const STATUT_PAYE = 'paye';
    public const STATUT_RETARD = 'retard';
    public const STATUT_ANNULE = 'annule';

    // ===== RELATIONS =====
    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    // ===== SCOPES =====
    public function scopeEnAttente($query)
    {
        return $query->where('statut_paiement', self::STATUT_EN_ATTENTE);
    }

    public function scopePayees($query)
    {
        return $query->where('statut_paiement', self::STATUT_PAYE);
    }

    public function scopeEnRetard($query)
    {
        return $query->where('statut_paiement', self::STATUT_RETARD)
            ->orWhere(function ($q) {
                $q->where('statut_paiement', self::STATUT_EN_ATTENTE)
                    ->where('date_echeance', '<', today());
            });
    }

    // ===== ACCESSEURS =====
    public function getMontantPayeAttribute(): float
    {
        return $this->paiements->sum('montant');
    }

    public function getResteAPayerAttribute(): float
    {
        return max(0, $this->montant_ttc - $this->montant_paye);
    }

    // ===== MÉTHODES =====
    public function verifierEtMettreAJourStatut(): void
    {
        $montantPaye = $this->montant_paye;

        if ($montantPaye >= $this->montant_ttc) {
            $this->update(['statut_paiement' => self::STATUT_PAYE]);
        } elseif ($montantPaye > 0) {
            $this->update(['statut_paiement' => self::STATUT_PARTIEL]);
        }
    }
}