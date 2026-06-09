<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes, BelongsToCompany;

    protected $fillable = [
        'user_id', 'company_id', 'station_id',
        'employee_code', 'hire_date', 'salary',
    ];

    protected $casts = ['hire_date' => 'date', 'salary' => 'decimal:2'];

    public function user(): BelongsTo    { return $this->belongsTo(User::class); }
    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function station(): BelongsTo { return $this->belongsTo(Station::class); }

    public function bookings(): BelongsToMany
    {
        return $this->belongsToMany(Booking::class, 'booking_employee')
            ->withTimestamps();
    }

    public function qualityChecks(): HasMany
    {
        return $this->hasMany(QualityCheck::class);
    }
}
