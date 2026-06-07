<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaiementRequest;
use App\Http\Resources\PaiementResource;
use App\Models\Facture;
use App\Models\Notification;
use App\Models\Paiement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaiementController extends Controller
{
    /**
     * Liste des paiements
     */
    public function index(Request $request): JsonResponse
    {
        $query = Paiement::with(['facture', 'client']);

        $user = $request->user();

        // CORRIGÉ : Un client ne doit pas voir les paiements des autres !
        if ($user->isClient) {
            $query->where('client_id', $user->id);
        } elseif ($user->role?->nom === 'employe') {
            return response()->json(['success' => false, 'message' => 'Accès interdit.'], 403);
        }

        if ($request->has('facture_id')) {
            $query->where('facture_id', $request->facture_id);
        }

        if ($request->has('mode_paiement')) {
            $query->where('mode_paiement', $request->mode_paiement);
        }

        if ($request->has('date_debut')) {
            $query->whereDate('date_paiement', '>=', $request->date_debut);
        }

        if ($request->has('date_fin')) {
            $query->whereDate('date_paiement', '<=', $request->date_fin);
        }

        $perPage = $request->get('per_page', 15);
        $paiements = $query->orderByDesc('date_paiement')->paginate($perPage);

        return response()->json([
            'paiements' => PaiementResource::collection($paiements),
            'pagination' => [
                'total' => $paiements->total(),
                'per_page' => $paiements->perPage(),
                'current_page' => $paiements->currentPage(),
                'last_page' => $paiements->lastPage(),
            ],
        ]);
    }

    /**
     * Enregistrer un paiement
     */
    public function store(StorePaiementRequest $request): JsonResponse
    {
        $facture = Facture::findOrFail($request->facture_id);
        $user = $request->user();

        // CORRIGÉ (FAILLE SÉCURITÉ CRITIQUE) : Empêcher un client de payer ou d'intercepter la facture d'un autre
        if ($user->isClient && $facture->client_id !== $user->id) {
            return response()->json(['message' => 'Cette facture ne vous appartient pas.'], 403);
        }

        // Vérifier que le montant ne dépasse pas le reste à payer
        $resteAPayer = $facture->reste_a_payer;
        if ($request->montant > $resteAPayer + 0.01) {
            return response()->json([
                'message' => "Le montant dépasse le reste à payer ({$resteAPayer}).",
            ], 422);
        }

        // Vérifier que la facture n'est pas annulée ou déjà payée
        if (in_array($facture->statut_paiement, [Facture::STATUT_ANNULE, Facture::STATUT_PAYE])) {
            return response()->json([
                'message' => 'Cette facture ne peut plus recevoir de paiements.',
            ], 422);
        }

        // Encapsulation dans une transaction de base de données pour la sécurité des écritures
        $paiement = DB::transaction(function () use ($request, $facture, $user) {
            $paiement = Paiement::create([
                'facture_id' => $request->facture_id,
                'client_id' => $user->isClient ? $user->id : $facture->client_id,
                'montant' => $request->montant,
                'mode_paiement' => $request->mode_paiement,
            ]);

            // Recharger la facture et mettre à jour son état si elle est totalement soldée
            $facture->refresh();
            return $paiement;
        });

        // Notifier le client si c'est un admin/employé qui enregistre l'action
        if (!$user->isClient) {
            Notification::creerPourUser(
                $facture->client_id,
                'paiement',
                'Paiement enregistré',
                "Un paiement de {$request->montant} a été enregistré pour la facture {$facture->numero_facture}.",
                'app'
            );
        }

        return response()->json([
            'message' => 'Paiement enregistré avec succès.',
            'paiement' => new PaiementResource($paiement),
            'facture_statut' => $facture->statut_paiement,
            'reste_a_payer' => $facture->reste_a_payer,
        ], 201);
    }

    /**
     * Statistiques des paiements
     */
    public function stats(Request $request): JsonResponse
    {
        $query = Paiement::query();

        if ($request->has('date_debut') && $request->has('date_fin')) {
            $query->whereBetween('date_paiement', [$request->date_debut, $request->date_fin]);
        } else {
            $query->whereMonth('date_paiement', now()->month)
                  ->whereYear('date_paiement', now()->year);
        }

        $totalMontant = (clone $query)->sum('montant');
        $totalPaiements = (clone $query)->count();

        $parMode = (clone $query)
            ->select('mode_paiement')
            ->selectRaw('SUM(montant) as total, COUNT(*) as nombre')
            ->groupBy('mode_paiement')
            ->get();

        return response()->json([
            'total_montant' => round($totalMontant, 2),
            'total_paiements' => $totalPaiements,
            'montant_moyen' => $totalPaiements > 0 ? round($totalMontant / $totalPaiements, 2) : 0,
            'par_mode' => $parMode,
        ]);
    }
}