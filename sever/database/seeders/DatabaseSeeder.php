<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Service;
use App\Models\Role;
use App\Models\TypeVehicule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Création des Rôles et récupération directe des instances
        $adminRole = Role::updateOrCreate(['nom' => 'admin']);
        $employeRole = Role::updateOrCreate(['nom' => 'employe']);
        $clientRole = Role::updateOrCreate(['nom' => 'client']);

        // 2. Création des utilisateurs tests (avec updateOrCreate pour éviter les doublons d'email si on relance le seeder)
        User::updateOrCreate(
            ['email' => 'admin@lavoto.com'],
            [
                'nom' => 'LAVOTO', 'prenom' => 'Admin',
                'password' => Hash::make('admin'), 'telephone' => '0600000001',
                'role_id' => $adminRole->id, 'statut' => 'actif', 'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'employe@lavoto.com'],
            [
                'nom' => 'Martin', 'prenom' => 'Jean',
                'password' => Hash::make('employe'), 'telephone' => '0600000002',
                'role_id' => $employeRole->id, 'statut' => 'actif', 'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'client@lavoto.com'],
            [
                'nom' => 'Dupont', 'prenom' => 'Pierre',
                'password' => Hash::make('client'), 'telephone' => '0610000001',
                'role_id' => $clientRole->id, 'statut' => 'actif', 'email_verified_at' => now(),
            ]
        );

        // 3. Types de véhicules
        foreach (['Voiture', 'SUV', 'Utilitaire', 'Moto'] as $type) {
            TypeVehicule::updateOrCreate(['nom' => $type]);
        }

        // 4. Services
        $services = [
            ['nom' => 'Lavage Express', 'categorie' => 'lavage', 'duree_estimee' => '00:20:00', 'prix_base' => 30.00, 'statut' => 'disponible'],
            ['nom' => 'Lavage Complet', 'categorie' => 'lavage', 'duree_estimee' => '01:00:00', 'prix_base' => 80.00, 'statut' => 'disponible'],
        ];
        
        foreach ($services as $service) {
            Service::updateOrCreate(['nom' => $service['nom']], $service);
        }
    }
}