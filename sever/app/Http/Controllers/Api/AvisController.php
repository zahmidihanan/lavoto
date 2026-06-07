<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAvisRequest;
use App\Http\Resources\AvisClientResource;
use App\Models\AvisClient;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvisController extends Controller
{
    /**
     * Liste des avis
     */
    public function index(Request $request): JsonResponse
    {
        $query = AvisClient::with(['client', 'employe', 'reservation.service']);

        // Par défaut, ne montrer que les approuvés pour le public
        if ($request->user()?->isAdmin || $request->user()?->isGerant) {
            // Voir tous les avis
        } else {
            $query->approuves();
        }

        if ($request->has('employe_id')) {
            $query->byEmploye($request->employe_id);
        }

        if ($request->has('note_min')) {
            $query->where('note', '>=', $request->note_min);
        }

        $perPage = $request->get('per_page', 15);
        $avis = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'avis' => AvisClientResource::collection($avis->items()),
            'pagination' => [
                'total' => $avis->total(),
                'per_page' => $avis->perPage(),
                'current_page' => $avis->currentPage(),
                'last_page' => $avis->lastPage(),
            ],
        ]);
    }

    /**
     * Créer un avis
     */
    public function store(StoreAvisRequest $request): JsonResponse
    {
        $user = $request->user();
        $reservation = Reservation::findOrFail($request->reservation_id);

        // Vérifier que c'est le client de la réservation
        if ($reservation->client_id !== $user->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas laisser un avis pour cette réservation.',
            ], 403);
        }

        // Vérifier que la réservation est terminée
        if ($reservation->statut !== Reservation::STATUT_TERMINE) {
            return response()->json([
                'message' => 'La réservation doit être terminée pour laisser un avis.',
            ], 422);
        }

        // Vérifier qu'un avis n'existe pas déjà
        if (AvisClient::where('reservation_id', $reservation->id)->exists()) {
            return response()->json([
                'message' => 'Vous avez déjà laissé un avis pour cette réservation.',
            ], 422);
        }

        // Vérifier qu'un employé est assigné
        if (!$reservation->employe_id) {
            return response()->json([
                'message' => 'Aucun employé assigné à cette réservation.',
            ], 422);
        }

        $avis = AvisClient::create([
            'reservation_id' => $request->reservation_id,
            'client_id' => $user->id,
            'employe_id' => $reservation->employe_id,
            'note' => $request->note,
            'commentaire' => $request->commentaire,
            'recommande' => $request->recommande ?? true,
            'statut' => 'en_attente',
        ]);

        return response()->json([
            'message' => 'Avis soumis avec succès. Il sera visible après approbation.',
            'avis' => new AvisClientResource($avis->load(['client', 'employe'])),
        ], 201);
    }

    /**
     * Approuver/Rejeter un avis (Admin/Gérant)
     */
    public function updateStatut(Request $request, AvisClient $avis): JsonResponse
    {
        $validated = $request->validate([
            'statut' => 'required|in:approuve,rejete',
        ]);

        $avis->update($validated);

        return response()->json([
            'message' => "Avis {$validated['statut']}.",
            'avis' => new AvisClientResource($avis->load(['client', 'employe'])),
        ]);
    }

    /**
     * Avis en attente de modération
     */
    public function enAttente(): JsonResponse
    {
        $avis = AvisClient::with(['client', 'employe', 'reservation.service'])
            ->enAttente()
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'avis' => AvisClientResource::collection($avis),
            'total' => $avis->count(),
        ]);
    }

    /**
     * Statistiques des avis
     */
    public function stats(): JsonResponse
    {
        $total = AvisClient::approuves()->count();
        $moyenne = AvisClient::approuves()->avg('note');
        $recommandations = AvisClient::approuves()->where('recommande', true)->count();
        $tauxRecommandation = $total > 0 ? round(($recommandations / $total) * 100, 1) : 0;

        $distribution = AvisClient::approuves()
            ->select('note')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('note')
            ->orderBy('note')
            ->get();

        // Top employés
        $topEmployes = AvisClient::approuves()
            ->select('employe_id')
            ->selectRaw('AVG(note) as moyenne, COUNT(*) as nombre_avis')
            ->groupBy('employe_id')
            ->having('nombre_avis', '>=', 3)
            ->orderByDesc('moyenne')
            ->with('employe')
            ->limit(5)
            ->get();

        return response()->json([
            'total_avis' => $total,
            'note_moyenne' => round($moyenne, 1),
            'taux_recommandation' => $tauxRecommandation,
            'distribution_notes' => $distribution,
            'top_employes' => $topEmployes->map(fn($e) => [
                'employe' => $e->employe?->full_name,
                'moyenne' => round($e->moyenne, 1),
                'nombre_avis' => $e->nombre_avis,
            ]),
            'en_attente_moderation' => AvisClient::enAttente()->count(),
        ]);
    }
}