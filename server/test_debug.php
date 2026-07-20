<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = App\Models\User::find(2);
auth()->login($user);
$companyId = $user->company_id;
$companyFilter = function($q) use ($companyId) {
    return $companyId ? $q->where('company_id', $companyId) : $q;
};

$recentBookings = App\Models\Booking::query()
    ->with(['customer.user', 'service', 'vehicle', 'payment'])
    ->where($companyFilter)
    ->latest()
    ->limit(10)
    ->get();

echo 'Count: ' . $recentBookings->count() . PHP_EOL;
foreach ($recentBookings as $b) {
    echo 'ID: ' . $b->id . ' | Status: ' . $b->status . ' | Customer: ' . ($b->customer->id ?? 'null') . ' | Service: ' . ($b->service->name ?? 'null') . PHP_EOL;
}
