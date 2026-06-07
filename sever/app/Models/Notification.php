<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'type',
        'titre',
        'message',
        'canal',
        'lu',
    ];

    protected $casts = [
        'lu' => 'boolean',
        'created_at' => 'datetime',
    ];

    // ===== RELATIONS =====
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ===== SCOPES =====
    public function scopeNonLues($query)
    {
        return $query->where('lu', false);
    }

    public function scopeLues($query)
    {
        return $query->where('lu', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // ===== MÉTHODES =====
    public function marquerCommeLue(): void
    {
        $this->update(['lu' => true]);
    }

    public static function creerPourUser(int $userId, string $type, string $titre, string $message, string $canal = 'app'): self
    {
        return self::create([
            'user_id' => $userId,
            'type' => $type,
            'titre' => $titre,
            'message' => $message,
            'canal' => $canal,
        ]);
    }
}