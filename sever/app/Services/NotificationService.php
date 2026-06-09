<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class NotificationService
{
    public function send(int $userId, string $title, string $body, string $type = '', array $data = []): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'title'   => $title,
            'body'    => $body,
            'type'    => $type ?: null,
            'data'    => $data ?: null,
        ]);
    }

    public function forUser(User $user, array $filters): LengthAwarePaginator
    {
        $query = $user->notifications()->latest();

        if (isset($filters['unread']) && $filters['unread']) {
            $query->whereNull('read_at');
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function markRead(Notification $notification): void
    {
        $notification->markAsRead();
    }

    public function markAllRead(User $user): int
    {
        return $user->notifications()->whereNull('read_at')->update(['read_at' => now()]);
    }

    public function unreadCount(User $user): int
    {
        return $user->notifications()->whereNull('read_at')->count();
    }

    public function delete(Notification $notification): void
    {
        $notification->delete();
    }
}
