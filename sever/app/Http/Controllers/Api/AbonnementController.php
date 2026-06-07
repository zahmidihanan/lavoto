<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAbonnementRequest;
use App\Http\Resources\AbonnementResource;
use App\Models\Abonnement;
use App\Models\Notification;
use App\Models\TypeAbonnement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbonnementController extends Controller
{
    /**
     * Liste des abonnements
     */
    public function index(Request $request): JsonResponse
    {
        $query = Abonnement::with(['client', 'typeAbonnement']);

        $user = $request->user();

        if ($user->isClient) {
            $query->where('client_id', $user->id);
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        $perPage = $request->get('per_page', 15);
        $abonnements = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'abonnements' => AbonnementResource::collection($abonnements->items()),
            'pagination' => [
                'total' => $abonnements->total(),
                'per_page' => $abonnements->perPage(),
                'current_page' => $abonnements->currentPage(),
                'last_page' => $abonnements->lastPage(),
            ],
        ]);
    }

    /**
     * Souscrire à un abonnement
     */
    public function store(StoreAbonnementRequest $request): JsonResponse
    {
        $user = $request->user();
        $typeAbonnement = TypeAbonnement::findOrFail($request->type_abonnement_id);

        // Vérifier si le client a déjà un abonnement actif
        $abonnementActif = Abonnement::actifs()
            ->where('client_id', $user->id)
            ->first();

        if ($abonnementActif) {
            return response()->json([
                'message' => 'Vous avez déjà un abonnement actif jusqu\'au ' . $abonnementActif->date_fin->format('d/m/Y'),
            ], 422);
        }

        $dateDebut = today();
        $dateFin = $dateDebut->copy()->addMonths($typeAbonnement->duree_mois);

        $abonnement = Abonnement::create([
            'client_id' => $user->id,
            'type_abonnement_id' => $typeAbonnement->id,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'prix_paye' => $typeAbonnement->prix,
            'statut' => 'actif',
        ]);

        return response()->json([
            'message' => 'Abonnement souscrit avec succès.',
            'abonnement' => new AbonnementResource($abonnement->load(['client', 'typeAbonnement'])),
        ], 201);
    }

    /**
     * Annuler un abonnement
     */
    public function cancel(Abonnement $abonnement): JsonResponse
    {
        $user = request()->user();

        if ($abonnement->client_id !== $user->id && !$user->isAdmin) {
            abort(403);
        }

        if (!$abonnement->estActif()) {
            return response()->json([
                'message' => 'Cet abonnement n\'est pas actif.',
            ], 422);
        }

        $abonnement->update(['statut' => 'annule']);

        return response()->json([
            'message' => 'Abonnement annulé.',
            'abonnement' => new AbonnementResource($abonnement->load(['client', 'typeAbonnement'])),
        ]);
    }

    /**
     * Types d'abonnements disponibles
     */
    public function types(): JsonResponse
    {
        return response()->json([
            'types' => TypeAbonnement::all(),
        ]);
    }

    /**
     * Statistiques des abonnements
     */
    public function stats(): JsonResponse
    {
        $actifs = Abonnement::actifs()->count();
        $expires = Abonnement::expires()->count();
        $total = Abonnement::count();
        $revenuTotal = Abonnement::sum('prix_paye');
        $revenuMensuel = Abonnement::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('prix_paye');

        return response()->json([
            'total' => $total,
            'actifs' => $actifs,
            'expires_bientot' => $expires,
            'revenu_total' => $revenuTotal,
            'revenu_mensuel' => $revenuMensuel,
            'par_type' => TypeAbonnement::withCount(['abonnements as total'])
                ->withSum('abonnements as revenu', 'prix_paye')
                ->get(),
        ]);
    }
}