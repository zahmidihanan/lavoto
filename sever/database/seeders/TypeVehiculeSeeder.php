<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TypeVehiculeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('types_vehicules')->insert([
            ['nom' => 'Citadine', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'Berline', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'SUV / 4x4', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'Utilitaire', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}