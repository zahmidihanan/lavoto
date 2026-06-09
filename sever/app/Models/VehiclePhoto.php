<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehiclePhoto extends Model
{
    protected $fillable = ['booking_id', 'image_path', 'type', 'caption'];

    public function booking(): BelongsTo { return $this->belongsTo(Booking::class); }
}
