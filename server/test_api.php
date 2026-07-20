<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Simulate dashboard logic for admin user
$user = \App\Models\User::withoutGlobalScope('company')->where('email', 'admin@lavoto-demo.com')->first();
echo "Admin user: {$user->name}, company_id: " . ($user->company_id ?? 'null') . "\n\n";

// Manually set auth
auth()->setUser($user);

$period = 'month';
$startDate = match ($period) {
    'week' => now()->startOfWeek(),
    'year' => now()->startOfYear(),
    default => now()->startOfMonth(),
};
echo "Start date: {$startDate}\n";
echo "Current time: " . now() . "\n\n";

$companyId = $user->company_id;
$companyFilter = fn($q) => $companyId ? $q->where('company_id', $companyId) : $q;

echo "=== Bookings by status (with global scope + manual filter) ===\n";
try {
    $bookings = \App\Models\Booking::query()
        ->where('created_at', '>=', $startDate)
        ->where($companyFilter)
        ->selectRaw('status, count(*) as count')
        ->groupBy('status')
        ->pluck('count', 'status');
    foreach ($bookings as $status => $count) {
        echo "  $status: $count\n";
    }
} catch (\Exception $e) {
    echo "  ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== Recent Bookings ===\n";
try {
    $recentBookings = \App\Models\Booking::query()
        ->with(['customer.user', 'service', 'vehicle', 'payment'])
        ->where($companyFilter)
        ->latest()
        ->limit(10)
        ->get();
    
    echo "  Count: " . $recentBookings->count() . "\n";
    foreach ($recentBookings as $b) {
        echo "  ID: {$b->id}, customer: " . ($b->customer?->user?->name ?? 'N/A') . ", service: " . ($b->service?->name ?? 'N/A') . ", status: {$b->status}, created_at: {$b->created_at}\n";
    }
} catch (\Exception $e) {
    echo "  ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== Recent Bookings WITHOUT global scope ===\n";
try {
    $recentBookings2 = \App\Models\Booking::withoutGlobalScope('company')
        ->with(['customer.user', 'service', 'vehicle', 'payment'])
        ->where($companyFilter)
        ->latest()
        ->limit(10)
        ->get();
    
    echo "  Count: " . $recentBookings2->count() . "\n";
    foreach ($recentBookings2 as $b) {
        echo "  ID: {$b->id}, company_id: {$b->company_id}, customer: " . ($b->customer?->user?->name ?? 'N/A') . ", service: " . ($b->service?->name ?? 'N/A') . ", status: {$b->status}, created_at: {$b->created_at}\n";
    }
} catch (\Exception $e) {
    echo "  ERROR: " . $e->getMessage() . "\n";
}
