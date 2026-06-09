<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QualityCheck extends Model
{
    protected $fillable = ['booking_id', 'employee_id', 'notes', 'passed', 'rating'];

    protected $casts = ['passed' => 'boolean'];

    public function booking(): BelongsTo  { return $this->belongsTo(Booking::class); }
    public function employee(): BelongsTo { return $this->belongsTo(Employee::class); }
}
