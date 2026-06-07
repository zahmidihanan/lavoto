<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Liste toutes les notifications de l'utilisateur connecté (Client, Employé ou Admin)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Notification::where('user_id', $user->id);

        // Filtre optionnel pour ne récupérer que les non-lues
        if ($request->has('only_unread') && $request->only_unread == true) {
            $query->whereNull('read_at');
        }

        $perPage = $request->get('per_page', 20);
        $notifications = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'success' => true,
            'notifications' => $notifications->items(),
            'pagination' => [
                'total' => $notifications->total(),
                'per_page' => $notifications->perPage(),
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
            ]
        ]);
    }

    /**
     * GET /api/notifications/unread-count
     * Renvoie le nombre de pastilles rouges à afficher sur l'icône de cloche
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'success' => true,
            'unread_count' => $count
        ]);
    }

    /**
     * PUT /api/notifications/{notification}/read
     * Marquer une notification spécifique comme lue
     */
    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        // Sécurité : Vérifier que la notification appartient bien à l'utilisateur connecté
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Action interdite.'], 403);
        }

        if (is_null($notification->read_at)) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification marquée comme lue.'
        ]);
    }

    /**
     * PUT /api/notifications/read-all
     * Bouton "Tout marquer comme lu" pour vider la liste d'un coup
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Toutes vos notifications ont été marquées comme lues.'
        ]);
    }

    /**
     * DELETE /api/notifications/{notification}
     * Supprimer définitivement une alerte de son flux
     */
    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Action interdite.'], 403);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification supprimée.'
        ]);
    }
}