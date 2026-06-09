<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Company extends Model
{
    use SoftDeletes, LogsActivity;

    protected $fillable = ['name', 'slug', 'status'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty();
    }

    public function stations(): HasMany   { return $this->hasMany(Station::class); }
    public function users(): HasMany      { return $this->hasMany(User::class); }
    public function customers(): HasMany  { return $this->hasMany(Customer::class); }
    public function employees(): HasMany  { return $this->hasMany(Employee::class); }
    public function services(): HasMany   { return $this->hasMany(Service::class); }
    public function bookings(): HasMany   { return $this->hasMany(Booking::class); }
    public function coupons(): HasMany    { return $this->hasMany(Coupon::class); }
}
