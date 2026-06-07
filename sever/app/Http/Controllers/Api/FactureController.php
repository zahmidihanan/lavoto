<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FactureResource;
use App\Models\Facture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FactureController extends Controller
{
    /**
     * Liste des factures
     */
    public function index(Request $request): JsonResponse
    {
        $query = Facture::with(['client', 'reservation.service', 'paiements']);

        $user = $request->user();

        // Filtrage strict selon le rôle
        if ($user->isClient) {
            $query->where('client_id', $user->id);
        } elseif ($user->role?->nom === 'employe') {
            // Un employé n'a pas accès à la comptabilité globale
            return response()->json(['success' => false, 'message' => 'Accès interdit.'], 403);
        }

        if ($request->has('statut_paiement')) {
            $query->where('statut_paiement', $request->statut_paiement);
        }

        if ($request->has('date_debut')) {
            $query->whereDate('date_facture', '>=', $request->date_debut);
        }

        if ($request->has('date_fin')) {
            $query->whereDate('date_facture', '<=', $request->date_fin);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('numero_facture', 'LIKE', "%{$search}%");
        }

        $perPage = $request->get('per_page', 15);
        $factures = $query->orderByDesc('date_facture')->paginate($perPage);

        return response()->json([
            'factures' => FactureResource::collection($factures),
            'pagination' => [
                'total' => $factures->total(),
                'per_page' => $factures->perPage(),
                'current_page' => $factures->currentPage(),
                'last_page' => $factures->lastPage(),
            ],
        ]);
    }

    /**
     * Détails d'une facture
     */
    public function show(Facture $facture): JsonResponse
    {
        $user = request()->user();

        // Protection contre la lecture trans-comptes
        if (($user->isClient && $facture->client_id !== $user->id) || $user->role?->nom === 'employe') {
            return response()->json(['success' => false, 'message' => 'Accès interdit.'], 403);
        }

        $facture->load(['client', 'reservation.service', 'reservation.vehicule', 'paiements']);

        return response()->json([
            'facture' => new FactureResource($facture),
        ]);
    }

    /**
     * Statistiques des factures (Optimisées en une seule requête d'agrégation)
     */
    public function stats(Request $request): JsonResponse
    {
        $query = Facture::query();

        if ($request->has('date_debut') && $request->has('date_fin')) {
            $query->whereBetween('date_facture', [$request->date_debut, $request->date_fin]);
        } else {
            $query->whereMonth('date_facture', now()->month)
                  ->whereYear('date_facture', now()->year);
        }

        // On regroupe toutes les opérations en une seule passe SQL pour soulager le serveur
        $metrics = $query->selectRaw("
            COUNT(*) as total_factures,
            SUM(montant_ht) as montant_total_ht,
            SUM(montant_ttc) as montant_total_ttc,
            SUM(CASE WHEN statut_paiement = 'paye' THEN 1 ELSE 0 END) as factures_payees,
            SUM(CASE WHEN statut_paiement = 'en_attente' THEN 1 ELSE 0 END) as factures_en_attente,
            SUM(CASE WHEN statut_paiement = 'en_retard' THEN 1 ELSE 0 END) as factures_en_retard
        ")->first();

        $totalFactures = $metrics->total_factures ?? 0;
        $montantTotalTtc = $metrics->montant_total_ttc ?? 0;
        $montantTotalHt = $metrics->montant_total_ht ?? 0;
        $montantTotalTva = $montantTotalTtc - $montantTotalHt;

        return response()->json([
            'total_factures' => $totalFactures,
            'montant_total_ht' => round($montantTotalHt, 2),
            'montant_total_tva' => round($montantTotalTva, 2),
            'montant_total_ttc' => round($montantTotalTtc, 2),
            'factures_payees' => (int) $metrics->factures_payees,
            'factures_en_attente' => (int) $metrics->factures_en_attente,
            'factures_en_retard' => (int) $metrics->factures_en_retard,
            'taux_paiement' => $totalFactures > 0
                ? round(($metrics->factures_payees / $totalFactures) * 100, 1)
                : 0,
        ]);
    }
}