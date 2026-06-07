<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Facture;
use App\Models\Vehicule;
use App\Models\Abonnement;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard/client
     * Donne un aperçu complet au client sur son garage et ses dépenses
     */
    public function client(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Statistiques des réservations du client
        $resMetrics = Reservation::where('client_id', $user->id)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
                SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
                SUM(CASE WHEN statut = 'termine' THEN 1 ELSE 0 END) as termines
            ")->first();

        // 2. Total dépensé par le client (uniquement les factures payées)
        $totalDepense = Facture::where('client_id', $user->id)
            ->where('statut_paiement', 'paye')
            ->sum('montant_ttc');

        // 3. Prochaine réservation planifiée (Rendez-vous à venir)
        $prochaineReservation = Reservation::with(['service', 'vehicule'])
            ->where('client_id', $user->id)
            ->whereIn('statut', ['en_attente', 'confirme'])
            ->where('date_debut', '>=', now())
            ->orderBy('date_debut', 'asc')
            ->first();

        // 4. Nombre de véhicules enregistrés dans son garage
        $nombreVehicules = Vehicule::where('user_id', $user->id)->count();

        // 5. Vérifier s'il a un abonnement actif
        $abonnementActif = Abonnement::where('client_id', $user->id)
            ->where('statut', 'actif')
            ->first();

        return response()->json([
            'success' => true,
            'kpis' => [
                'total_reservations' => (int) $resMetrics->total,
                'reservations_en_attente' => (int) $resMetrics->en_attente,
                'reservations_en_cours' => (int) $resMetrics->en_cours,
                'total_depense' => round($totalDepense, 2),
                'nombre_vehicules' => $nombreVehicules,
                'a_abonnement_actif' => !is_null($abonnementActif),
            ],
            'prochain_rendez_vous' => $prochaineReservation,
        ]);
    }

    /**
     * GET /api/dashboard/employe
     * Fournit le planning de la journée et l'efficacité de l'employé/laveur
     */
    public function employe(Request $request): JsonResponse
    {
        $user = $request->user();

        // Sécurité supplémentaire au cas où le middleware laisserait passer un client
        if ($user->isClient) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        // 1. Missions du jour (Toutes celles planifiées pour AUJOURD'HUI)
        $missionsAujourdhui = Reservation::with(['client', 'service', 'vehicule'])
            ->where('employe_id', $user->id)
            ->whereDate('date_debut', now()->toDateString())
            ->orderBy('date_debut', 'asc')
            ->get();

        // 2. Métriques de performance globales pour cet employé
        $globalMetrics = Reservation::where('employe_id', $user->id)
            ->selectRaw("
                COUNT(*) as total_attribuees,
                SUM(CASE WHEN statut = 'termine' THEN 1 ELSE 0 END) as termines,
                SUM(CASE WHEN statut = 'annule' THEN 1 ELSE 0 END) as annulees
            ")->first();

        // 3. Calculer les tâches restantes pour aujourd'hui
        $restantAujourdhui = $missionsAujourdhui->whereIn('statut', ['confirme', 'en_route', 'en_cours'])->count();

        return response()->json([
            'success' => true,
            'planning_aujourdhui' => $missionsAujourdhui,
            'kpis' => [
                'missions_aujourdhui_count' => $missionsAujourdhui->count(),
                'missions_restantes_aujourdhui' => $restantAujourdhui,
                'total_missions_terminees' => (int) $globalMetrics->termines,
                'total_missions_annulees' => (int) $globalMetrics->annulees,
            ]
        ]);
    }

    /**
     * GET /api/dashboard/admin
     * Le poste de pilotage central de Lavoto : Vue d'ensemble sur le business (Chiffre d'affaires, volume, clients)
     */
    public function admin(Request $request): JsonResponse
    {
        $user = $request->user();

        // Vérification stricte du rôle administrateur
        if ($user->isClient || $user->role?->nom !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        // 1. Chiffre d'affaires (Revenus encaissés ce mois-ci vs Total historique)
        $caTotal = Facture::where('statut_paiement', 'paye')->sum('montant_ttc');
        $caMoisEnCours = Facture::where('statut_paiement', 'paye')
            ->whereMonth('date_facture', now()->month)
            ->whereYear('date_facture', now()->year)
            ->sum('montant_ttc');

        // 2. Volume de réservations (En attente de validation / En cours d'exécution aujourd'hui)
        $resAdminMetrics = Reservation::selectRaw("
            SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as demandes_en_attente,
            SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as lavages_en_cours,
            COUNT(*) as volume_historique_total
        ")->first();

        // 3. Évolution de la base utilisateur
        $totalClients = User::whereHas('role', fn($q) => $q->where('nom', 'client'))->count();
        $totalEmployes = User::whereHas('role', fn($q) => $q->where('nom', 'employe'))->count();

        // 4. Top 3 des services les plus demandés (pour analyser le catalogue)
        $topServices = Reservation::select('service_id', DB::raw('count(*) as total'))
            ->with('service:id,nom,prix_base')
            ->groupBy('service_id')
            ->orderByDesc('total')
            ->take(3)
            ->get();

        return response()->json([
            'success' => true,
            'kpis' => [
                'chiffre_affaires_total' => round($caTotal, 2),
                'chiffre_affaires_mois_actuel' => round($caMoisEnCours, 2),
                'demandes_en_attente_validation' => (int) $resAdminMetrics->demandes_en_attente,
                'lavages_en_cours_actuellement' => (int) $resAdminMetrics->lavages_en_cours,
                'total_clients_inscrits' => $totalClients,
                'total_employes_actifs' => $totalEmployes,
            ],
            'top_services' => $topServices
        ]);
    }
}