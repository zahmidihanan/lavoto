<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            // 1. Compte Administrateur
            [
                'nom' => 'Admin',
                'prenom' => 'Lavoto',
                'email' => 'admin@lavoto.com',
                'password' => Hash::make('password123'),
                'telephone' => '+212600000001',
                'role_id' => 1, // admin
                'statut' => 'actif',
                'created_at' => now(),
                'updated_at' => now()
            ],
            // 2. Compte Employé / Laveur
            [
                'nom' => 'El Alami',
                'prenom' => 'Ahmed',
                'email' => 'ahmed@lavoto.com',
                'password' => Hash::make('employe123'),
                'telephone' => '+212600000002',
                'role_id' => 2, // employe
                'statut' => 'actif',
                'created_at' => now(),
                'updated_at' => now()
            ],
            // 3. Compte Client
            [
                'nom' => 'Benjelloun',
                'prenom' => 'Youssef',
                'email' => 'client@lavoto.com',
                'password' => Hash::make('client123'),
                'telephone' => '+212600000003',
                'role_id' => 3, // client
                'statut' => 'actif',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}