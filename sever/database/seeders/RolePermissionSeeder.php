<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // ==================== PERMISSIONS ====================
        $permissions = [
            'dashboard.view',
            'users.manage',
            'reports.view',
            'reservations.manage',
            'reservations.create',
            'reservations.assign',
            'reservations.update.status',
            'reservations.view.own',
            'vehicles.manage.own',
            'services.manage',
            'factures.pay',
            'avis.create',
            'location.update'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // ==================== CRÉATION DES RÔLES ====================
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $admin      = Role::firstOrCreate(['name' => 'admin']);
        $gerant     = Role::firstOrCreate(['name' => 'gerant']);
        $employe    = Role::firstOrCreate(['name' => 'employe']);
        $client     = Role::firstOrCreate(['name' => 'client']);

        // Assignation des permissions
        $superAdmin->givePermissionTo(Permission::all());

        $admin->givePermissionTo([
            'dashboard.view', 'users.manage', 'reports.view', 
            'reservations.manage', 'services.manage'
        ]);

        $gerant->givePermissionTo([
            'reservations.manage', 
            'reservations.assign', 
            'reservations.update.status'
        ]);

        $employe->givePermissionTo([
            'reservations.view.own', 
            'reservations.update.status', 
            'location.update'
        ]);

        $client->givePermissionTo([
            'reservations.create', 
            'reservations.view.own', 
            'vehicles.manage.own',
            'factures.pay', 
            'avis.create'
        ]);

        // ==================== CRÉATION DES UTILISATEURS DE TEST ====================

        // Super Admin
        $superAdminUser = User::withoutGlobalScopes()->firstOrCreate(
            ['email' => 'superadmin@lavoto.ma'],
            [
                'nom'       => 'Super',
                'prenom'    => 'Admin',
                'password'  => bcrypt('password123'),
                'telephone' => '0612345678',
                'role_id'   => 1,           // ID du rôle admin
                'statut'    => 'actif'
            ]
        );
        $superAdminUser->assignRole('super_admin');

        // Admin normal
        $adminUser = User::withoutGlobalScopes()->firstOrCreate(
            ['email' => 'admin@lavoto.ma'],
            [
                'nom'       => 'Admin',
                'prenom'    => 'LAVOTO',
                'password'  => bcrypt('password123'),
                'telephone' => '0612345679',
                'role_id'   => 1,
                'statut'    => 'actif'
            ]
        );
        $adminUser->assignRole('admin');

        // Gérant
        $gerantUser = User::withoutGlobalScopes()->firstOrCreate(
            ['email' => 'gerant@lavoto.ma'],
            [
                'nom'       => 'El',
                'prenom'    => 'Gérant',
                'password'  => bcrypt('password123'),
                'telephone' => '0612345680',
                'role_id'   => 2,
                'statut'    => 'actif'
            ]
        );
        $gerantUser->assignRole('gerant');

        // Employé
        $employeUser = User::withoutGlobalScopes()->firstOrCreate(
            ['email' => 'employe@lavoto.ma'],
            [
                'nom'       => 'Ahmed',
                'prenom'    => 'Employe',
                'password'  => bcrypt('password123'),
                'telephone' => '0612345681',
                'role_id'   => 3,
                'statut'    => 'actif'
            ]
        );
        $employeUser->assignRole('employe');

        // Client
        $clientUser = User::withoutGlobalScopes()->firstOrCreate(
            ['email' => 'client@lavoto.ma'],
            [
                'nom'       => 'Ilham',
                'prenom'    => 'Client',
                'password'  => bcrypt('password123'),
                'telephone' => '0612345682',
                'role_id'   => 4,
                'statut'    => 'actif'
            ]
        );
        $clientUser->assignRole('client');

        $this->command->info('✅ Rôles et Permissions créés avec succès !');
        $this->command->info('Utilisateurs de test créés :');
        $this->command->info('• superadmin@lavoto.ma     → password: password123');
        $this->command->info('• admin@lavoto.ma          → password: password123');
        $this->command->info('• gerant@lavoto.ma         → password: password123');
        $this->command->info('• employe@lavoto.ma        → password: password123');
        $this->command->info('• client@lavoto.ma         → password: password123 (ton compte)');
    }
}