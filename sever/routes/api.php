<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\LoyaltyController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\QualityCheckController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\StationController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

// ── Public ─────────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);
    Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->name('verification.verify');
});

// Public services list
Route::get('/services/active', [ServiceController::class, 'active']);

// ── Authenticated (Sanctum token) ──────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout',                [AuthController::class, 'logout']);
        Route::get('/me',                     [AuthController::class, 'me']);
        Route::post('/refresh',               [AuthController::class, 'refresh']);
        Route::post('/profile',               [AuthController::class, 'updateProfile']);
        Route::post('/email/resend',          [AuthController::class, 'resendVerification']);
    });

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Users
    Route::apiResource('users', UserController::class);

    // Stations
    Route::apiResource('stations', StationController::class);

    // Services
    Route::apiResource('services', ServiceController::class);

    // Customers
    Route::apiResource('customers', CustomerController::class)->except(['store']);

    // Vehicles
    Route::apiResource('vehicles', VehicleController::class);

    // Employees
    Route::get('/employees/available', [EmployeeController::class, 'available']);
    Route::apiResource('employees', EmployeeController::class);

    // Bookings
    Route::post('/bookings/{booking}/status',           [BookingController::class, 'updateStatus']);
    Route::post('/bookings/{booking}/assign-employees', [BookingController::class, 'assignEmployees']);
    Route::post('/bookings/{booking}/cancel',           [BookingController::class, 'cancel']);
    Route::apiResource('bookings', BookingController::class)->except(['update', 'destroy']);

    // Payments
    Route::post('/payments/{payment}/refund', [PaymentController::class, 'refund']);
    Route::apiResource('payments', PaymentController::class)->except(['update', 'destroy']);

    // Coupons
    Route::post('/coupons/validate', [CouponController::class, 'validate']);
    Route::apiResource('coupons', CouponController::class);

    // Quality Checks
    Route::post('/quality-checks',       [QualityCheckController::class, 'store']);
    Route::get('/quality-checks/{qualityCheck}', [QualityCheckController::class, 'show']);

    // Notifications
    Route::get('/notifications',             [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count',[NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read',  [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all',   [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{id}',     [NotificationController::class, 'destroy']);

    // Loyalty
    Route::get('/customers/{customer}/loyalty',          [LoyaltyController::class, 'transactions']);
    Route::post('/customers/{customer}/loyalty/redeem',  [LoyaltyController::class, 'redeem']);
});
