<?php
$db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "=== BOOKINGS ===\n";
$stmt = $db->query("SELECT id, company_id, customer_id, vehicle_id, service_id, station_id, status, booking_date, booking_time, total_amount, created_at, deleted_at FROM bookings ORDER BY id DESC LIMIT 10");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$row['id']}, company_id: " . ($row['company_id'] ?? 'null') . ", customer_id: {$row['customer_id']}, status: {$row['status']}, date: {$row['booking_date']}, time: {$row['booking_time']}, amount: {$row['total_amount']}, deleted_at: " . ($row['deleted_at'] ?? 'null') . ", created: {$row['created_at']}\n";
}

echo "\n=== USERS ===\n";
$stmt = $db->query("SELECT id, name, email, company_id FROM users ORDER BY id");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$row['id']}, name: {$row['name']}, email: {$row['email']}, company_id: " . ($row['company_id'] ?? 'null') . "\n";
}
