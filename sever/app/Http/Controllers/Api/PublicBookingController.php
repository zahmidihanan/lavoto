<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Station;
use App\Models\User;
use App\Models\Vehicle;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PublicBookingController extends Controller
{
    use ApiResponse;

    private function findCompany(string $slug): Company
    {
        return Company::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();
    }

    public function company(string $slug): JsonResponse
    {
        $company = $this->findCompany($slug);

        return $this->success([
            'id'   => $company->id,
            'name' => $company->name,
            'slug' => $company->slug,
        ]);
    }

    public function services(string $slug): JsonResponse
    {
        $company = $this->findCompany($slug);

        $services = Service::where('company_id', $company->id)
            ->where('is_active', true)
            ->orderBy('price')
            ->get(['id', 'name', 'description', 'price', 'duration_minutes']);

        return $this->success($services);
    }

    public function stations(string $slug): JsonResponse
    {
        $company = $this->findCompany($slug);

        $stations = Station::where('company_id', $company->id)
            ->where('status', 'active')
            ->get(['id', 'name', 'address', 'city', 'phone']);

        return $this->success($stations);
    }

    public function book(Request $request, string $slug): JsonResponse
    {
        $company = $this->findCompany($slug);

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|max:255',
            'phone'        => 'nullable|string|max:20',
            'brand'        => 'required|string|max:100',
            'model'        => 'required|string|max:100',
            'year'         => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'color'        => 'nullable|string|max:50',
            'plate_number' => 'required|string|max:20',
            'service_id'   => 'required|integer|exists:services,id',
            'station_id'   => 'required|integer|exists:stations,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required|string',
            'notes'        => 'nullable|string|max:500',
        ]);

        // Verify service and station belong to this company and are active
        $service = Service::where('id', $validated['service_id'])
            ->where('company_id', $company->id)
            ->where('is_active', true)
            ->firstOrFail();

        Station::where('id', $validated['station_id'])
            ->where('company_id', $company->id)
            ->where('status', 'active')
            ->firstOrFail();

        // Email is globally unique — search without company scope
        $user = User::withoutGlobalScope('company')
            ->where('email', $validated['email'])
            ->first();

        if (! $user) {
            setPermissionsTeamId($company->id);

            $user = User::create([
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'phone'      => $validated['phone'] ?? null,
                'password'   => Hash::make(Str::random(24)),
                'company_id' => $company->id,
                'status'     => 'active',
            ]);

            $user->assignRole('customer');
        }

        // Find or create a customer profile for THIS company (user may belong to another company)
        $customer = Customer::withoutGlobalScope('company')
            ->where('user_id', $user->id)
            ->where('company_id', $company->id)
            ->first()
            ?? Customer::create([
                'user_id'    => $user->id,
                'company_id' => $company->id,
            ]);

        // Find or create vehicle (match by plate + company)
        $vehicle = Vehicle::where('plate_number', $validated['plate_number'])
            ->where('company_id', $company->id)
            ->first()
            ?? Vehicle::create([
                'brand'        => $validated['brand'],
                'model'        => $validated['model'],
                'year'         => $validated['year'],
                'color'        => $validated['color'] ?? null,
                'plate_number' => $validated['plate_number'],
                'customer_id'  => $customer->id,
                'company_id'   => $company->id,
            ]);

        $booking = Booking::create([
            'company_id'      => $company->id,
            'customer_id'     => $customer->id,
            'vehicle_id'      => $vehicle->id,
            'service_id'      => $service->id,
            'station_id'      => $validated['station_id'],
            'booking_date'    => $validated['booking_date'],
            'booking_time'    => $validated['booking_time'],
            'notes'           => $validated['notes'] ?? null,
            'status'          => 'pending',
            'total_amount'    => $service->price,
            'discount_amount' => 0,
        ]);

        return $this->created([
            'booking_id'   => $booking->id,
            'booking_date' => $booking->booking_date instanceof \Carbon\Carbon
                ? $booking->booking_date->toDateString()
                : (string) $booking->booking_date,
            'booking_time' => $booking->booking_time,
            'company_name' => $company->name,
            'service_name' => $service->name,
            'total_amount' => $booking->total_amount,
        ], 'Booking confirmed! We\'ll see you soon.');
    }
}
