<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes, BelongsToCompany;

    protected $fillable = ['user_id', 'company_id', 'address', 'loyalty_points'];

    // Bypass tenant scope — a customer's user may belong to a different company (public portal bookings)
    public function user(): BelongsTo  { return $this->belongsTo(User::class)->withoutGlobalScope('company'); }
    public function company(): BelongsTo { return $this->belongsTo(Company::class); }

    public function vehicles(): HasMany { return $this->hasMany(Vehicle::class); }
    public function bookings(): HasMany { return $this->hasMany(Booking::class); }

    public function loyaltyTransactions(): HasMany
    {
        return $this->hasMany(LoyaltyTransaction::class);
    }
}
