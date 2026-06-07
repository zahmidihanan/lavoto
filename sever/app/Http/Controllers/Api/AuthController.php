<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    // POST /api/auth/register
    public function register(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'telephone' => 'nullable|string|max:20',
        ]);

        // Assigner par défaut le rôle "client" lors de l'inscription publique
        $clientRole = Role::where('nom', 'client')->first();

        $user = User::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'telephone' => $validated['telephone'] ?? null,
            'role_id' => $clientRole->id,
            'statut' => 'actif',
        ]);

        $token = $user->createToken('lavoto_auth')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user->load('role'),
            'token' => $token
        ], 201);
    }

    // POST /api/auth/login
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::with('role')->where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Les identifiants fournis sont incorrects.'
            ], 401);
        }

        if ($user->statut === 'inactif') {
            return response()->json([
                'success' => false,
                'message' => 'Votre compte est suspendu.'
            ], 403);
        }

        // Mettre à jour la date de dernière connexion
        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('lavoto_auth')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token
        ], 200);
    }

    // POST /api/auth/logout (Supprime le token actuel)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie.'
        ], 200);
    }

    // POST /api/auth/logout-all (Déconnecte tous les appareils)
    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion globale de tous les appareils réussie.'
        ], 200);
    }

    // GET /api/auth/me
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->load('role')
        ], 200);
    }

    // PUT /api/auth/profile
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'telephone' => 'nullable|string|max:20',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour.',
            'data' => $user
        ], 200);
    }

    // PUT /api/auth/password
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Le mot de passe actuel est incorrect.'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe modifié avec succès.'
        ], 200);
    }
}