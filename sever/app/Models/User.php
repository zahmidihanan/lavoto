<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string $password
 * @property int|null $company_id
 * @property int|null $station_id
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property \Illuminate\Support\Carbon|null $last_login_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read Company|null $company
 * @property-read Station|null $station
 * @property-read Customer|null $customer
 * @property-read Employee|null $employee
 */
class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasRoles, LogsActivity, BelongsToCompany;

    protected $fillable = [
        'name', 'email', 'phone', 'password',
        'company_id', 'station_id', 'status',
        'email_verified_at', 'last_login_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at'     => 'datetime',
        'password'          => 'hashed',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogIfAttributesChangedOnly(['last_login_at']);
    }

    public function isSuperAdmin(): bool { return $this->company_id === null; }
    public function isAdmin(): bool      { return $this->hasRole('admin'); }
    public function isEmployee(): bool   { return $this->hasRole('employee'); }
    public function isCustomer(): bool   { return $this->hasRole('customer'); }

    public function company(): BelongsTo  { return $this->belongsTo(Company::class); }
    public function station(): BelongsTo  { return $this->belongsTo(Station::class); }
    public function customer(): HasOne    { return $this->hasOne(Customer::class); }
    public function employee(): HasOne    { return $this->hasOne(Employee::class); }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
