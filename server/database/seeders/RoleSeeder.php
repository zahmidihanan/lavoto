<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Kept as a no-op stub. Role creation is handled by RolePermissionSeeder
 * via spatie/laravel-permission. The old custom roles table no longer exists.
 */
class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // intentionally empty — see RolePermissionSeeder
    }
}
