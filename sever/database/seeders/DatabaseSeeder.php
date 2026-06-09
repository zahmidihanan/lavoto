<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class, // permissions + role definitions
            CompanySeeder::class,        // demo company
            UserSeeder::class,           // super-admin + demo admin
        ]);
    }
}
