<?php

use Illuminate\Support\Facades\Route;

// Accueil par défaut du serveur
Route::get('/', function () {
    return view('welcome');
});

// Intercepteur universel pour les requêtes non-authentifiées de l'API
Route::get('/login', function () {
    return response()->json([
        'success' => false,
        'message' => 'Non authentifié. Veuillez fournir un token valide ou vous connecter.',
        'endpoints' => [
            'login' => url('/api/auth/login'),
            'register' => url('/api/auth/register')
        ]
    ], 401);
})->name('login');