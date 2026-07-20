<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use SoftDeletes, BelongsToCompany;

    protected $fillable = [
        'company_id', 'code', 'type', 'value',
        'min_amount', 'max_uses', 'used_count',
        'expires_at', 'is_active',
    ];

    protected $casts = [
        'value'      => 'decimal:2',
        'min_amount' => 'decimal:2',
        'expires_at' => 'datetime',
        'is_active'  => 'boolean',
    ];

    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function bookings(): HasMany  { return $this->hasMany(Booking::class); }

    public function isValid(float $amount = 0): bool
    {
        return $this->is_active
            && ($this->expires_at === null || $this->expires_at->isFuture())
            && ($this->max_uses === null || $this->used_count < $this->max_uses)
            && ($this->min_amount === null || $amount >= $this->min_amount);
    }

    public function calculateDiscount(float $amount): float
    {
        return $this->type === 'percentage'
            ? round($amount * $this->value / 100, 2)
            : min((float) $this->value, $amount);
    }
}
