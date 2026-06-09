<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Station extends Model
{
    use SoftDeletes, BelongsToCompany, LogsActivity;

    protected $fillable = ['company_id', 'name', 'address', 'city', 'phone', 'status'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty();
    }

    public function company(): BelongsTo  { return $this->belongsTo(Company::class); }
    public function users(): HasMany      { return $this->hasMany(User::class); }
    public function employees(): HasMany  { return $this->hasMany(Employee::class); }
    public function bookings(): HasMany   { return $this->hasMany(Booking::class); }
}
