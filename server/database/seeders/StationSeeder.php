<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Station;
use Illuminate\Database\Seeder;

class StationSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'lavoto-demo')->firstOrFail();

        $stations = [
            [
                'name'    => 'Lavoto Downtown',
                'address' => '123 Clean Street',
                'city'    => 'Casablanca',
                'phone'   => '+212 5 22 12 34 56',
                'status'  => 'active',
            ],
            [
                'name'    => 'Lavoto Mall Branch',
                'address' => '45 Shopping Avenue',
                'city'    => 'Casablanca',
                'phone'   => '+212 5 22 65 43 21',
                'status'  => 'active',
            ],
        ];

        foreach ($stations as $station) {
            Station::updateOrCreate(
                ['company_id' => $company->id, 'name' => $station['name']],
                array_merge($station, ['company_id' => $company->id])
            );
        }

        $this->command->info('Stations seeded successfully.');
    }
}
