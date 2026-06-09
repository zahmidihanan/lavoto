<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Booking extends Model
{
    use SoftDeletes, BelongsToCompany, LogsActivity;

    protected $fillable = [
        'company_id', 'customer_id', 'vehicle_id', 'service_id',
        'station_id', 'coupon_id', 'booking_date', 'booking_time',
        'status', 'total_amount', 'discount_amount', 'notes',
        'cancelled_at', 'cancellation_reason',
    ];

    protected $casts = [
        'booking_date'    => 'date',
        'total_amount'    => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'cancelled_at'    => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['status'])->logOnlyDirty();
    }

    public function customer(): BelongsTo  { return $this->belongsTo(Customer::class); }
    public function vehicle(): BelongsTo   { return $this->belongsTo(Vehicle::class); }
    public function service(): BelongsTo   { return $this->belongsTo(Service::class); }
    public function station(): BelongsTo   { return $this->belongsTo(Station::class); }
    public function coupon(): BelongsTo    { return $this->belongsTo(Coupon::class); }
    public function company(): BelongsTo   { return $this->belongsTo(Company::class); }

    public function employees(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'booking_employee')->withTimestamps();
    }

    public function payment(): HasOne         { return $this->hasOne(Payment::class); }
    public function qualityCheck(): HasOne    { return $this->hasOne(QualityCheck::class); }
    public function photos(): HasMany         { return $this->hasMany(VehiclePhoto::class); }
    public function vehiclePhotos(): HasMany  { return $this->hasMany(VehiclePhoto::class); }

    public function scopeForCustomer($query, int $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function isCancellable(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }
}
