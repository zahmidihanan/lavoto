<?php

use App\Http\Controllers\Api\AbonnementController;
use App\Http\Controllers\Api\AvisController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FactureController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VehiculeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API ROUTES - LAVOTO (Rôles : admin, employe, client)
|--------------------------------------------------------------------------
*/

// ===================================================================
// ROUTES PUBLIQUES
// ===================================================================
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// ===================================================================
// ROUTES AUTHENTIFIÉES
// ===================================================================
Route::middleware('auth:sanctum')->group(function () {

    // ------ AUTHENTIFICATION ------
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'changePassword']);
    });

    // ------ DASHBOARDS (Sécurisés par Rôles respectifs) ------
    Route::get('/dashboard/client', [DashboardController::class, 'client'])->middleware('role:client');
    Route::get('/dashboard/employe', [DashboardController::class, 'employe'])->middleware('role:employe');
    Route::get('/dashboard/admin', [DashboardController::class, 'admin'])->middleware('role:admin');

    // ------ NOTIFICATIONS ------
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    // ------ VÉHICULES ------
    Route::get('/vehicules/types', [VehiculeController::class, 'types']); 
    Route::apiResource('vehicules', VehiculeController::class);

    // ------ SERVICES ------
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/categories', [ServiceController::class, 'categories']);
    Route::get('/services/{service}', [ServiceController::class, 'show']);
    
    // Actions administratives sur les services
    Route::middleware('role:admin')->group(function () {
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);
    });

    // ------ RÉSERVATIONS ------
    Route::apiResource('reservations', ReservationController::class)->only(['index', 'store', 'show']);
    Route::put('/reservations/{reservation}/annuler', [ReservationController::class, 'annuler']); 
    
    // Actions réservées au personnel
    Route::middleware('role:admin,employe')->group(function () {
        Route::put('/reservations/{reservation}/statut', [ReservationController::class, 'updateStatut']);
        Route::get('/reservations-today', [ReservationController::class, 'today']);
    });

    // ------ FACTURES & PAIEMENTS ------
    // Note : L'indexation globale ou l'accès aux factures/paiements doit être filtré par ID utilisateur dans le contrôleur pour les clients !
    Route::get('/factures', [FactureController::class, 'index']);
    Route::get('/factures/{facture}', [FactureController::class, 'show']);
    Route::get('/paiements', [PaiementController::class, 'index']);
    Route::post('/paiements', [PaiementController::class, 'store']); 

    // ------ AVIS ------
    Route::get('/avis', [AvisController::class, 'index']);
    Route::post('/avis', [AvisController::class, 'store']);
    
    // Modération des avis
    Route::middleware('role:admin')->group(function () {
        Route::put('/avis/{avis}/statut', [AvisController::class, 'updateStatut']);
        Route::get('/avis-pending', [AvisController::class, 'pending']);
    });

    // ------ ABONNEMENTS ------
    Route::get('/abonnements-types', [AbonnementController::class, 'types']); 
    Route::get('/abonnements', [AbonnementController::class, 'index']);
    Route::post('/abonnements', [AbonnementController::class, 'store']);
    Route::put('/abonnements/{abonnement}/cancel', [AbonnementController::class, 'cancel']); // Changé en PUT (Standard REST pour modification d'état)

    // ------ UTILISATEURS & EMPLOYÉS (Espace Admin) ------
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/available-employees', [UserController::class, 'availableEmployees']); 
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });

    // ------ STATISTIQUES GLOBALES (Admin uniquement) ------
    Route::middleware('role:admin')->prefix('stats')->group(function () {
        Route::get('/users', [UserController::class, 'stats']);
        Route::get('/services', [ServiceController::class, 'stats']);
        Route::get('/reservations', [ReservationController::class, 'stats']);
        Route::get('/factures', [FactureController::class, 'stats']);
        Route::get('/paiements', [PaiementController::class, 'stats']);
        Route::get('/avis', [AvisController::class, 'stats']);
        Route::get('/abonnements', [AbonnementController::class, 'stats']);
    });
});