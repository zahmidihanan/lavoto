<?php

namespace App\Models;

use App\Models\Abonnement;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'telephone',
        'role_id',
        'statut',
        'email_verified_at',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    // ===== ACCESSEURS =====
    public function getFullNameAttribute(): string
    {
        return "{$this->prenom} {$this->nom}";
    }

    public function getIsAdminAttribute(): bool
    {
        return $this->role?->nom === 'admin';
    }

    public function getIsGerantAttribute(): bool
    {
        return $this->role?->nom === 'gerant';
    }

    public function getIsEmployeAttribute(): bool
    {
        return $this->role?->nom === 'employe';
    }

    public function getIsClientAttribute(): bool
    {
        return $this->role?->nom === 'client';
    }

    // ===== RELATIONS =====
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function vehicules(): HasMany
    {
        return $this->hasMany(Vehicule::class);
    }

    public function reservationsClient(): HasMany
    {
        return $this->hasMany(Reservation::class, 'client_id');
    }

    public function reservationsEmploye(): HasMany
    {
        return $this->hasMany(Reservation::class, 'employe_id');
    }

    public function factures(): HasMany
    {
        return $this->hasMany(Facture::class, 'client_id');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class, 'client_id');
    }

    public function avisDonnes(): HasMany
    {
        return $this->hasMany(AvisClient::class, 'client_id');
    }

    public function avisRecus(): HasMany
    {
        return $this->hasMany(AvisClient::class, 'employe_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function abonnements(): HasMany
    {
        return $this->hasMany(Abonnement::class, 'client_id');
    }

    public function historiques(): HasMany
    {
        return $this->hasMany(ReservationHistorique::class, 'employe_id');
    }

    // ===== SCOPES =====
    public function scopeAdmins($query)
    {
        return $query->whereHas('role', fn($q) => $q->where('nom', 'admin'));
    }

    public function scopeGerants($query)
    {
        return $query->whereHas('role', fn($q) => $q->where('nom', 'gerant'));
    }

    public function scopeEmployes($query)
    {
        return $query->whereHas('role', fn($q) => $q->where('nom', 'employe'));
    }

    public function scopeClients($query)
    {
        return $query->whereHas('role', fn($q) => $q->where('nom', 'client'));
    }

    public function scopeActifs($query)
    {
        return $query->where('statut', 'actif');
    }

    public function scopeEnConges($query)
    {
        return $query->where('statut', 'conges');
    }
}