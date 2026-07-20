<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Super-admin: no company, no role.
        User::withoutGlobalScopes()->updateOrCreate(
            ['email' => 'super@lavoto.com'],
            [
                'name'              => 'Super Admin',
                'password'          => Hash::make('password'),
                'phone'             => '+212600000000',
                'company_id'        => null,
                'station_id'        => null,
                'status'            => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Demo company admin.
        $company = Company::where('slug', 'lavoto-demo')->firstOrFail();

        setPermissionsTeamId($company->id);

        $admin = User::withoutGlobalScopes()->updateOrCreate(
            ['email' => 'admin@lavoto-demo.com'],
            [
                'name'              => 'Admin Demo',
                'password'          => Hash::make('password'),
                'phone'             => '+212600000001',
                'company_id'        => $company->id,
                'station_id'        => null,
                'status'            => 'active',
                'email_verified_at' => now(),
            ]
        );

        $admin->syncRoles(['admin']);
    }
}
