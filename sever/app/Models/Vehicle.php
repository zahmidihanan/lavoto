<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use SoftDeletes, BelongsToCompany;

    protected $fillable = [
        'customer_id', 'company_id',
        'brand', 'model', 'year', 'color', 'plate_number',
    ];

    public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
    public function company(): BelongsTo  { return $this->belongsTo(Company::class); }
    public function bookings(): HasMany   { return $this->hasMany(Booking::class); }
}
