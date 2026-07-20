<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'lavoto-demo')->firstOrFail();

        $services = [
            [
                'name'             => 'Full Wash',
                'category'         => 'full',
                'description'      => 'Complete exterior and interior cleaning. Hand wash, protective wax, tire shine, interior vacuum, dashboard cleaning, and streak-free windows.',
                'price'            => 149,
                'duration_minutes' => 60,
                'options'          => ['Hand wash & wax', 'Tire shine', 'Interior vacuum', 'Dashboard cleaning', 'Streak-free windows'],
            ],
            [
                'name'             => 'Interior Detail',
                'category'         => 'interior',
                'description'      => 'Deep interior cleaning: full vacuum, carpet shampoo, leather conditioning, disinfection, and deodorizing for a fresh cabin.',
                'price'            => 119,
                'duration_minutes' => 50,
                'options'          => ['Full vacuum', 'Carpet shampoo', 'Leather & fabric care', 'Interior disinfection', 'Deodorizing'],
            ],
            [
                'name'             => 'Exterior Wash',
                'category'         => 'exterior',
                'description'      => 'Premium hand wash with top-grade products. Decontamination, protective wax, tire shine, and wheel cleaning.',
                'price'            => 99,
                'duration_minutes' => 40,
                'options'          => ['Premium hand wash', 'Decontamination', 'Protective wax', 'Tire shine', 'Wheel cleaning'],
            ],
            [
                'name'             => 'Premium Service',
                'category'         => 'premium',
                'description'      => 'The ultimate treatment. Includes everything plus optical polish, ceramic coating, engine bay cleaning, and a final quality check.',
                'price'            => 249,
                'duration_minutes' => 120,
                'options'          => ['Everything included', 'Optical polish', 'Ceramic coating', 'Engine bay cleaning', 'Quality check'],
            ],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['company_id' => $company->id, 'name' => $service['name']],
                $service
            );
        }
    }
}
