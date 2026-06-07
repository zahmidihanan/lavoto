<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('services')->insert([
            [
                'nom' => 'Lavage Express Extérieur',
                'categorie' => 'lavage',
                'description' => 'Lavage haute pression de la carrosserie et des jantes.',
                'duree_estimee' => '00:30:00',
                'prix_base' => 50.00,
                'statut' => 'disponible',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom' => 'Nettoyage Intérieur Complet',
                'categorie' => 'nettoyage',
                'description' => 'Aspiration complète, dépoussiérage des plastiques et nettoyage des vitres.',
                'duree_estimee' => '01:15:00',
                'prix_base' => 120.00,
                'statut' => 'disponible',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom' => 'Polissage & Lustrage',
                'categorie' => 'polissage',
                'description' => 'Correction des micro-rayures et application d\'une cire de protection brillante.',
                'duree_estimee' => '03:00:00',
                'prix_base' => 450.00,
                'statut' => 'disponible',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}