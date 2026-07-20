<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class NotificationController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly NotificationService $notificationService) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->notificationService->forUser($request->user(), $request->all());
        return $this->paginated(NotificationResource::collection($paginator));
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->notificationService->unreadCount($request->user());
        return $this->success(['count' => $count]);
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $notification = Notification::where('user_id', $request->user()->id)->findOrFail($id);
        $this->notificationService->markRead($notification);
        return $this->success(null, 'Notification marked as read.');
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $this->notificationService->markAllRead($request->user());
        return $this->success(null, 'All notifications marked as read.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $notification = Notification::where('user_id', $request->user()->id)->findOrFail($id);
        $this->notificationService->delete($notification);
        return $this->noContent();
    }

    public function stream(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $token = $request->query('token');
        if (!$token) {
            return response()->json(['error' => 'Token required'], 401);
        }

        $accessToken = PersonalAccessToken::findToken($token);
        if (!$accessToken || !$accessToken->tokenable) {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        $user = $accessToken->tokenable;
        $lastCheck = $request->query('last_check', now()->toISOString());

        return response()->stream(function () use ($user, &$lastCheck) {
            set_time_limit(0);
            ignore_user_abort(false);

            // Send initial connection event
            echo "event: connected\n";
            echo "data: " . json_encode(['status' => 'connected']) . "\n\n";
            ob_flush();
            flush();

            $checkCount = 0;
            while (true) {
                $checkCount++;

                $notifications = Notification::where('user_id', $user->id)
                    ->where('created_at', '>', $lastCheck)
                    ->orderBy('created_at', 'asc')
                    ->limit(50)
                    ->get();

                if ($notifications->isNotEmpty()) {
                    $lastCheck = now()->toISOString();

                    /** @var Notification $notif */
                    foreach ($notifications as $notif) {
                        echo "event: notification\n";
                        echo "data: " . json_encode([
                            'id'         => $notif->id,
                            'title'      => $notif->title,
                            'body'       => $notif->body,
                            'type'       => $notif->type,
                            'data'       => $notif->data,
                            'read_at'    => $notif->read_at,
                            'is_read'    => !is_null($notif->read_at),
                            'created_at' => $notif->created_at,
                        ]) . "\n\n";
                    }
                    ob_flush();
                    flush();
                } elseif ($checkCount % 3 === 0) {
                    // Heartbeat every ~9 seconds
                    echo "event: heartbeat\n";
                    echo "data: " . json_encode(['time' => now()->toISOString()]) . "\n\n";
                    ob_flush();
                    flush();
                }

                if (connection_aborted()) {
                    break;
                }

                sleep(3);
            }
        }, 200, [
            'Content-Type'        => 'text/event-stream',
            'Cache-Control'       => 'no-cache',
            'Connection'          => 'keep-alive',
            'X-Accel-Buffering'   => 'no',
        ]);
    }
}
