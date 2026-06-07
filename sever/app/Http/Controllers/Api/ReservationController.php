<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\UpdateReservationStatutRequest;
use App\Http\Resources\ReservationResource;
use App\Models\Facture;
use App\Models\Notification;
use App\Models\Reservation;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    /**
     * Liste des réservations
     */
    public function index(Request $request): JsonResponse
    {
        $query = Reservation::with(['client', 'employe', 'service', 'vehicule', 'facture']);

        $user = $request->user();

        // Filtrer selon le rôle
        if ($user->isClient) {
            $query->where('client_id', $user->id);
        } elseif ($user->isEmploye) {
            $query->where('employe_id', $user->id);
        }

        // Filtres additionnels
        if ($request->has('statut')) {
            if (is_array($request->statut)) {
                $query->whereIn('statut', $request->statut);
            } else {
                $query->where('statut', $request->statut);
            }
        }

        if ($request->has('date_debut')) {
            $query->whereDate('date_debut', '>=', $request->date_debut);
        }

        if ($request->has('date_fin')) {
            $query->whereDate('date_fin', '<=', $request->date_fin);
        }

        if ($request->has('employe_id')) {
            $query->where('employe_id', $request->employe_id);
        }

        if ($request->has('service_id')) {
            $query->where('service_id', $request->service_id);
        }

        if ($request->has('ville')) {
            $query->where('ville', 'LIKE', "%{$request->ville}%");
        }

        $sortBy = $request->get('sort_by', 'date_debut');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = $request->get('per_page', 15);
        $reservations = $query->paginate($perPage);

        return response()->json([
            'reservations' => ReservationResource::collection($reservations->items()),
            'pagination' => [
                'total' => $reservations->total(),
                'per_page' => $reservations->perPage(),
                'current_page' => $reservations->currentPage(),
                'last_page' => $reservations->lastPage(),
            ],
        ]);
    }

    /**
     * Créer une réservation
     */
    public function store(StoreReservationRequest $request): JsonResponse
    {
        $user = $request->user();
        $service = Service::findOrFail($request->service_id);

        $reservation = Reservation::create([
            'client_id' => $user->id,
            'service_id' => $request->service_id,
            'vehicule_id' => $request->vehicule_id,
            'date_debut' => $request->date_debut,
            'adresse' => $request->adresse,
            'ville' => $request->ville,
            'gps' => $request->gps,
            'prix_estime' => $service->prix_base,
            'notes' => $request->notes,
            'statut' => Reservation::STATUT_EN_ATTENTE,
        ]);

        // Notifier les gérants
        $gerants = \App\Models\User::gerants()->get();
        foreach ($gerants as $gerant) {
            Notification::creerPourUser(
                $gerant->id,
                'reservation',
                'Nouvelle réservation',
                "Une nouvelle réservation #{$reservation->id} a été créée par {$user->full_name}.",
                'app'
            );
        }

        return response()->json([
            'message' => 'Réservation créée avec succès.',
            'reservation' => new ReservationResource($reservation->load(['client', 'service', 'vehicule'])),
        ], 201);
    }

    /**
     * Détails d'une réservation
     */
    public function show(Reservation $reservation): JsonResponse
    {
        $user = request()->user();

        // Vérifier les droits d'accès
        if ($user->isClient && $reservation->client_id !== $user->id) {
            abort(403);
        }
        if ($user->isEmploye && $reservation->employe_id !== $user->id) {
            abort(403);
        }

        $reservation->load([
            'client',
            'employe',
            'service',
            'vehicule',
            'facture.paiements',
            'historiques.employe',
            'avis',
        ]);

        return response()->json([
            'reservation' => new ReservationResource($reservation),
        ]);
    }

    /**
     * Mettre à jour le statut d'une réservation
     */
    public function updateStatut(UpdateReservationStatutRequest $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();
        $nouveauStatut = $request->statut;

        // Assigner un employé si fourni
        if ($request->employe_id) {
            $reservation->update(['employe_id' => $request->employe_id]);
        }

        // Changer le statut et créer l'historique
        $reservation->changerStatut(
            $nouveauStatut,
            $user->id,
            $request->commentaire
        );

        // Mettre à jour la localisation si fournie
        if ($request->localisation_employe) {
            $reservation->historiques()->latest()->first()?->update([
                'localisation_employe' => $request->localisation_employe,
            ]);
        }

        // Si terminé, générer la facture automatiquement
        if ($nouveauStatut === Reservation::STATUT_TERMINE && !$reservation->facture) {
            $this->genererFacture($reservation);
        }

        // Mettre à jour date_fin si terminé/annulé
        if (in_array($nouveauStatut, [Reservation::STATUT_TERMINE, Reservation::STATUT_ANNULE])) {
            $reservation->update(['date_fin' => now()]);
        }

        // Notifier le client
        Notification::creerPourUser(
            $reservation->client_id,
            'reservation',
            'Mise à jour de votre réservation',
            "Votre réservation #{$reservation->id} est maintenant : " . str_replace('_', ' ', $nouveauStatut),
            'app'
        );

        $reservation->load(['client', 'employe', 'service', 'vehicule', 'historiques']);

        return response()->json([
            'message' => 'Statut mis à jour.',
            'reservation' => new ReservationResource($reservation),
        ]);
    }

    /**
     * Annuler une réservation (client)
     */
    public function annuler(Reservation $reservation): JsonResponse
    {
        $user = request()->user();

        if ($reservation->client_id !== $user->id) {
            abort(403);
        }

        if (!in_array($reservation->statut, [Reservation::STATUT_EN_ATTENTE, Reservation::STATUT_CONFIRME])) {
            return response()->json([
                'message' => 'Cette réservation ne peut plus être annulée.',
            ], 422);
        }

        $reservation->changerStatut(Reservation::STATUT_ANNULE, null, 'Annulée par le client');
        $reservation->update(['date_fin' => now()]);

        return response()->json([
            'message' => 'Réservation annulée.',
            'reservation' => new ReservationResource($reservation->load(['client', 'service', 'vehicule'])),
        ]);
    }

    /**
     * Statistiques des réservations
     */
    public function stats(Request $request): JsonResponse
    {
        $query = Reservation::query();

        if ($request->has('date_debut') && $request->has('date_fin')) {
            $query->whereBetween('date_debut', [$request->date_debut, $request->date_fin]);
        } else {
            $query->whereMonth('date_debut', now()->month)
                ->whereYear('date_debut', now()->year);
        }

        $total = (clone $query)->count();
        $terminees = (clone $query)->terminees()->count();
        $annulees = (clone $query)->annulees()->count();
        $actives = (clone $query)->actives()->count();
        $enAttente = (clone $query)->byStatut(Reservation::STATUT_EN_ATTENTE)->count();
        $chiffreAffaire = (clone $query)->terminees()->sum('prix_estime');

        return response()->json([
            'total' => $total,
            'actives' => $actives,
            'en_attente' => $enAttente,
            'terminees' => $terminees,
            'annulees' => $annulees,
            'taux_completion' => $total > 0 ? round(($terminees / $total) * 100, 1) : 0,
            'chiffre_affaire_estime' => $chiffreAffaire,
            'par_statut' => (clone $query)
                ->select('statut')
                ->selectRaw('COUNT(*) as total')
                ->groupBy('statut')
                ->get(),
            'par_ville' => (clone $query)
                ->select('ville')
                ->selectRaw('COUNT(*) as total')
                ->groupBy('ville')
                ->orderByDesc('total')
                ->limit(10)
                ->get(),
        ]);
    }

    /**
     * Réservations du jour
     */
    public function aujourdHui(): JsonResponse
    {
        $reservations = Reservation::with(['client', 'employe', 'service', 'vehicule'])
            ->aujourdHui()
            ->orderBy('date_debut')
            ->get();

        return response()->json([
            'reservations' => ReservationResource::collection($reservations),
            'total' => $reservations->count(),
        ]);
    }

    /**
     * Générer la facture automatiquement
     */
    private function genererFacture(Reservation $reservation): void
    {
        $service = $reservation->service;
        $montantHt = $service->prix_base;
        $tauxTva = 20.00;
        $montantTtc = $montantHt * (1 + $tauxTva / 100);

        Facture::create([
            'reservation_id' => $reservation->id,
            'client_id' => $reservation->client_id,
            'numero_facture' => $reservation->genererNumeroFacture(),
            'montant_ht' => $montantHt,
            'taux_tva' => $tauxTva,
            'montant_ttc' => round($montantTtc, 2),
            'frais_deplacement' => 0,
            'date_facture' => today(),
            'date_echeance' => today()->addDays(30),
            'statut_paiement' => Facture::STATUT_EN_ATTENTE,
        ]);
    }
}