<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Liste des utilisateurs (Admin/Gérant uniquement)
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('role');

        // Filtres
        if ($request->has('role')) {
            $query->whereHas('role', fn($q) => $q->where('nom', $request->role));
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'LIKE', "%{$search}%")
                    ->orWhere('prenom', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('telephone', 'LIKE', "%{$search}%");
            });
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

        return response()->json([
            'users' => UserResource::collection($users->items()),
            'pagination' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    /**
     * Détails d'un utilisateur
     */
    public function show(User $user): JsonResponse
    {
        $user->load(['role', 'vehicules', 'abonnements']);

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Mettre à jour un utilisateur (Admin/Gérant)
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user->update($request->validated());

        return response()->json([
            'message' => 'Utilisateur mis à jour.',
            'user' => new UserResource($user->load('role')),
        ]);
    }

    /**
     * Supprimer un utilisateur (Admin uniquement)
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé.',
        ]);
    }

    /**
     * Statistiques utilisateurs
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => User::count(),
            'admin' => User::admins()->count(),
            'gerants' => User::gerants()->count(),
            'employes' => User::employes()->count(),
            'clients' => User::clients()->count(),
            'actifs' => User::actifs()->count(),
            'inactifs' => User::where('statut', 'inactif')->count(),
            'en_conges' => User::enConges()->count(),
            'inscriptions_ce_mois' => User::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ]);
    }

    /**
     * Liste des employés disponibles
     */
    public function employesDisponibles(): JsonResponse
    {
        $employes = User::employes()
            ->actifs()
            ->whereDoesntHave('reservationsEmploye', function ($q) {
                $q->actives();
            })
            ->get();

        return response()->json([
            'employes' => UserResource::collection($employes->load('role')),
        ]);
    }
}