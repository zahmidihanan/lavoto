<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    // Désactive la gestion automatique de created_at et updated_at
    public $timestamps = false;

    protected $fillable = ['nom'];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}