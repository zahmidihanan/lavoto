<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'company.view',
            'company.edit',
            'stations.view',
            'stations.create',
            'stations.edit',
            'stations.delete',
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'roles.view',
            'roles.assign',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        // Roles are created without a team scope (company_id = null) as global templates.
        // setPermissionsTeamId scopes them per tenant at runtime.
        $admin    = Role::firstOrCreate(['name' => 'admin',    'guard_name' => 'web']);
        $manager  = Role::firstOrCreate(['name' => 'manager',  'guard_name' => 'web']);
        $employee = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

        $admin->syncPermissions($permissions);

        $manager->syncPermissions([
            'company.view',
            'stations.view', 'stations.create', 'stations.edit', 'stations.delete',
            'users.view', 'users.create', 'users.edit',
        ]);

        $employee->syncPermissions([
            'stations.view',
            'users.view',
        ]);
    }
}
