<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'employe_id',
        'service_id',
        'vehicule_id',
        'date_debut',
        'date_fin',
        'adresse',
        'ville',
        'gps',
        'prix_estime',
        'statut',
        'notes',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'prix_estime' => 'decimal:2',
    ];

    // ===== CONSTANCES =====
    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_CONFIRME = 'confirme';
    public const STATUT_EN_ROUTE = 'en_route';
    public const STATUT_EN_COURS = 'en_cours';
    public const STATUT_TERMINE = 'termine';
    public const STATUT_ANNULE = 'annule';

    public static function getStatuts(): array
    {
        return [
            self::STATUT_EN_ATTENTE,
            self::STATUT_CONFIRME,
            self::STATUT_EN_ROUTE,
            self::STATUT_EN_COURS,
            self::STATUT_TERMINE,
            self::STATUT_ANNULE,
        ];
    }

    // ===== RELATIONS =====
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function employe(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employe_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function vehicule(): BelongsTo
    {
        return $this->belongsTo(Vehicule::class);
    }

    public function facture(): HasOne
    {
        return $this->hasOne(Facture::class);
    }

    public function historiques(): HasMany
    {
        return $this->hasMany(ReservationHistorique::class);
    }

    public function avis(): HasOne
    {
        return $this->hasOne(AvisClient::class);
    }

    // ===== SCOPES =====
    public function scopeByStatut($query, string $statut)
    {
        return $query->where('statut', $statut);
    }

    public function scopeByClient($query, int $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeByEmploye($query, int $employeId)
    {
        return $query->where('employe_id', $employeId);
    }

    public function scopeActives($query)
    {
        return $query->whereIn('statut', [
            self::STATUT_EN_ATTENTE,
            self::STATUT_CONFIRME,
            self::STATUT_EN_ROUTE,
            self::STATUT_EN_COURS,
        ]);
    }

    public function scopeTerminees($query)
    {
        return $query->where('statut', self::STATUT_TERMINE);
    }

    public function scopeAnnulees($query)
    {
        return $query->where('statut', self::STATUT_ANNULE);
    }

    public function scopeByDate($query, $dateDebut, $dateFin = null)
    {
        if ($dateFin) {
            return $query->whereBetween('date_debut', [$dateDebut, $dateFin]);
        }
        return $query->whereDate('date_debut', $dateDebut);
    }

    public function scopeAujourdHui($query)
    {
        return $query->whereDate('date_debut', today());
    }

    // ===== MÉTHODES =====
    public function changerStatut(string $nouveauStatut, ?int $employeId = null, ?string $commentaire = null): void
    {
        $ancienStatut = $this->statut;

        $this->update(['statut' => $nouveauStatut]);

        ReservationHistorique::create([
            'reservation_id' => $this->id,
            'employe_id' => $employeId,
            'ancien_statut' => $ancienStatut,
            'nouveau_statut' => $nouveauStatut,
            'commentaire' => $commentaire,
        ]);
    }

    public function genererNumeroFacture(): string
    {
        $date = now()->format('Ymd');
        $count = Facture::whereDate('date_facture', today())->count() + 1;
        return "FAC-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}