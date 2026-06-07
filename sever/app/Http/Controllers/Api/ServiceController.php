<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Liste des services
     */
    public function index(Request $request): JsonResponse
    {
        $query = Service::query();

        if ($request->has('categorie')) {
            $query->byCategorie($request->categorie);
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        } else {
            // Par défaut, montrer les disponibles pour les clients
            if (request()->user()?->isClient) {
                $query->disponibles();
            }
        }

        if ($request->has('search')) {
            $query->search($request->search);
        }

        $sortBy = $request->get('sort_by', 'nom');
        $sortDir = $request->get('sort_dir', 'asc');
        $query->orderBy($sortBy, $sortDir);

        if ($request->get('all', false)) {
            $services = $query->get();
        } else {
            $perPage = $request->get('per_page', 15);
            $services = $query->paginate($perPage);

            return response()->json([
                'services' => ServiceResource::collection($services->items()),
                'pagination' => [
                    'total' => $services->total(),
                    'per_page' => $services->perPage(),
                    'current_page' => $services->currentPage(),
                    'last_page' => $services->lastPage(),
                ],
            ]);
        }

        return response()->json([
            'services' => ServiceResource::collection($services),
        ]);
    }

    /**
     * Créer un service (Admin/Gérant)
     */
    public function store(StoreServiceRequest $request): JsonResponse
    {
        $service = Service::create($request->validated());

        return response()->json([
            'message' => 'Service créé avec succès.',
            'service' => new ServiceResource($service),
        ], 201);
    }

    /**
     * Détails d'un service
     */
    public function show(Service $service): JsonResponse
    {
        return response()->json([
            'service' => new ServiceResource($service),
        ]);
    }

    /**
     * Mettre à jour un service
     */
    public function update(StoreServiceRequest $request, Service $service): JsonResponse
    {
        $service->update($request->validated());

        return response()->json([
            'message' => 'Service mis à jour.',
            'service' => new ServiceResource($service),
        ]);
    }

    /**
     * Supprimer un service
     */
    public function destroy(Service $service): JsonResponse
    {
        if ($service->reservations()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce service : il est lié à des réservations.',
            ], 422);
        }

        $service->delete();

        return response()->json([
            'message' => 'Service supprimé.',
        ]);
    }

    /**
     * Catégories disponibles
     */
    public function categories(): JsonResponse
    {
        return response()->json([
            'categories' => Service::getCategories(),
        ]);
    }

    /**
     * Statistiques des services
     */
    public function stats(): JsonResponse
    {
        $services = Service::withCount(['reservations as total_reservations'])
            ->withSum('reservations as chiffre_affaire', 'prix_estime')
            ->orderByDesc('total_reservations')
            ->get();

        return response()->json([
            'total_services' => Service::count(),
            'disponibles' => Service::disponibles()->count(),
            'indisponibles' => Service::where('statut', 'indisponible')->count(),
            'par_categorie' => Service::select('categorie')
                ->selectRaw('COUNT(*) as total')
                ->groupBy('categorie')
                ->get(),
            'classement' => $services,
        ]);
    }
}