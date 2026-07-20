<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Service;
use App\Models\Station;
use App\Models\User;
use App\Models\Vehicle;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PublicBookingController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly NotificationService $notificationService,
        private readonly EmployeeRepositoryInterface $employeeRepo,
    ) {}

    private function findCompany(string $slug): Company
    {
        return Company::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();
    }

    public function companyDefault(): JsonResponse
    {
        $company = Company::where('status', 'active')->first();

        if (! $company) {
            return $this->error('No active company found.', 404);
        }

        return $this->success([
            'id'          => $company->id,
            'name'        => $company->name,
            'slug'        => $company->slug,
            'booking_url' => $company->booking_url,
        ]);
    }

    public function company(string $slug): JsonResponse
    {
        $company = $this->findCompany($slug);

        return $this->success([
            'id'          => $company->id,
            'name'        => $company->name,
            'slug'        => $company->slug,
            'booking_url' => $company->booking_url,
        ]);
    }

    public function services(string $slug): JsonResponse
    {
        $company = $this->findCompany($slug);

        $services = Service::where('company_id', $company->id)
            ->where('is_active', true)
            ->orderBy('price')
            ->get(['id', 'name', 'category', 'description', 'price', 'duration_minutes', 'options']);

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

    public function availability(Request $request, string $slug): JsonResponse
    {
        $company = $this->findCompany($slug);

        $request->validate([
            'date'       => 'required|date',
            'station_id' => 'nullable|integer',
        ]);

        $date      = $request->query('date');
        $stationId = (int) $request->query('station_id', 0);

        // Active employees for this company (optionally scoped to station)
        $empQuery = \App\Models\Employee::where('company_id', $company->id);
        if ($stationId > 0) {
            $empQuery->where('station_id', $stationId);
        }
        $totalEmployees = $empQuery->count();

        if ($totalEmployees === 0) {
            return $this->success(['full_slots' => [], 'has_employees' => false]);
        }

        // Active bookings on this date & station
        $bookings = \App\Models\Booking::where('company_id', $company->id)
            ->whereDate('booking_date', $date)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->when($stationId > 0, fn($q) => $q->where('station_id', $stationId))
            ->get();

        // Count bookings per time slot
        $countBySlot = [];
        foreach ($bookings as $booking) {
            $raw  = $booking->booking_time;
            $time = is_object($raw) ? $raw->format('H:i') : substr((string) $raw, 0, 5);
            $countBySlot[$time] = ($countBySlot[$time] ?? 0) + 1;
        }

        // A slot is full when at least 1 booking exists at that time
        $fullSlots = [];
        foreach ($countBySlot as $time => $count) {
            if ($count >= 1) {
                $fullSlots[] = $time;
            }
        }

        return $this->success([
            'full_slots'      => array_values($fullSlots),
            'total_employees' => $totalEmployees,
            'has_employees'   => true,
        ]);
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

        // An employee must be free at this station/date/time before we accept the booking
        $availableEmployee = $this->employeeRepo
            ->availableForStation($validated['station_id'], $validated['booking_date'], $validated['booking_time'])
            ->first();

        if (! $availableEmployee) {
            throw new \App\Exceptions\ApiException(
                'No employee available for this date and time. Please choose another slot.',
                422,
            );
        }

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
            'status'          => 'assigned',
            'total_amount'    => $service->price,
            'discount_amount' => 0,
        ]);

        $booking->employees()->attach($availableEmployee->id);

        Payment::create([
            'booking_id'      => $booking->id,
            'amount'          => $service->price,
            'payment_method'  => 'cash',
            'payment_status'  => 'pending',
        ]);

        // ── Send notifications ──────────────────────────────────────────────

        // Notify the customer
        $this->notificationService->send(
            userId: $user->id,
            title:  'Booking Confirmed',
            body:   "Your booking #{$booking->id} has been received.",
            type:   'booking_created',
            data:   ['booking_id' => $booking->id],
        );

        // Notify all admins of this company
        $admins = User::where(function ($q) use ($company) {
            $q->whereNull('company_id')
              ->orWhere('company_id', $company->id);
        })
        ->whereHas('roles', fn($q) => $q->where('name', 'admin'))
        ->get();

        foreach ($admins as $admin) {
            $this->notificationService->send(
                userId: $admin->id,
                title:  'New Booking',
                body:   "{$user->name} booked {$service->name} at {$booking->booking_time} on {$booking->booking_date}",
                type:   'booking_created',
                data:   [
                    'booking_id'    => $booking->id,
                    'customer_name' => $user->name,
                    'service_name'  => $service->name,
                    'amount'        => $booking->total_amount,
                ],
            );

            $this->notificationService->send(
                userId: $admin->id,
                title:  'Employee Assigned',
                body:   "{$availableEmployee->user->name} was automatically assigned to booking #{$booking->id}.",
                type:   'booking_assigned',
                data:   ['booking_id' => $booking->id, 'employee_id' => $availableEmployee->id],
            );
        }

        $this->notificationService->send(
            userId: $availableEmployee->user_id,
            title:  'New Assignment',
            body:   "You've been assigned to booking #{$booking->id} — {$service->name} on {$booking->booking_date} at {$booking->booking_time}.",
            type:   'booking_assigned',
            data:   ['booking_id' => $booking->id],
        );

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
