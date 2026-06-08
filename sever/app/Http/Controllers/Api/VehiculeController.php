<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehiculeRequest;
use App\Http\Requests\UpdateVehiculeRequest;
use App\Http\Resources\VehiculeResource;
use App\Models\TypeVehicule;
use App\Models\Vehicule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehiculeController extends Controller
{
    /**
     * Liste des véhicules
     */
    public function index(Request $request): JsonResponse
    {
        $query = Vehicule::with(['user', 'typeVehicule']);
        $user = $request->user();

        // Filtre par utilisateur (client voit que ses véhicules)
        if ($user?->isClient && !$user->isAdmin) {
            $query->where('user_id', $user->id);
        } elseif ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('type_vehicule_id')) {
            $query->where('type_vehicule_id', $request->type_vehicule_id);
        }

        if ($request->has('search')) {
            $query->search($request->search);
        }

        $perPage = $request->get('per_page', 15);
        $vehicules = $query->paginate($perPage);

        return response()->json([
            'vehicules' => VehiculeResource::collection($vehicules->items()),
            'pagination' => [
                'total' => $vehicules->total(),
                'per_page' => $vehicules->perPage(),
                'current_page' => $vehicules->currentPage(),
                'last_page' => $vehicules->lastPage(),
            ],
        ]);
    }

    /**
     * Créer un véhicule
     */
    public function store(StoreVehiculeRequest $request): JsonResponse
    {
        $user = $request->user();

        $vehicule = Vehicule::create([
            ...$request->validated(),
            'user_id' => $user?->isClient
                ? $user->id
                : ($request->user_id ?? $user?->id),
        ]);

        return response()->json([
            'message' => 'Véhicule créé avec succès.',
            'vehicule' => new VehiculeResource($vehicule->load(['user', 'typeVehicule'])),
        ], 201);
    }

    /**
     * Détails d'un véhicule
     */
    public function show(Vehicule $vehicule): JsonResponse
    {
        $vehicule->load(['user', 'typeVehicule', 'reservations']);

        return response()->json([
            'vehicule' => new VehiculeResource($vehicule),
        ]);
    }

    /**
     * Mettre à jour un véhicule
     */
    public function update(UpdateVehiculeRequest $request, Vehicule $vehicule): JsonResponse
    {
        $this->authorizeVehicule($vehicule);

        $vehicule->update($request->validated());

        return response()->json([
            'message' => 'Véhicule mis à jour.',
            'vehicule' => new VehiculeResource($vehicule->load(['user', 'typeVehicule'])),
        ]);
    }

    /**
     * Supprimer un véhicule
     */
    public function destroy(Vehicule $vehicule): JsonResponse
    {
        $this->authorizeVehicule($vehicule);

        // Vérifier s'il y a des réservations actives
        if ($vehicule->reservations()->actives()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce véhicule : il a des réservations actives.',
            ], 422);
        }

        $vehicule->delete();

        return response()->json([
            'message' => 'Véhicule supprimé.',
        ]);
    }

    /**
     * Types de véhicules disponibles
     */
    public function types(): JsonResponse
    {
        return response()->json([
            'types' => TypeVehicule::all(),
        ]);
    }

    /**
     * Vérifier l'autorisation sur le véhicule
     */
    private function authorizeVehicule(Vehicule $vehicule): void
    {
        $user = request()->user();
        if ($user->isClient && $vehicule->user_id !== $user->id) {
            abort(403, 'Vous n\'êtes pas le propriétaire de ce véhicule.');
        }
    }
}