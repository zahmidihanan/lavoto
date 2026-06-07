<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Le template racine (qui correspond à resources/views/app.blade.php)
     */
    protected $rootView = 'app';

    /**
     * Détermine la version des assets.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Définit les données qui sont partagées par défaut avec React.
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            // Tu pourras ajouter ici tes messages flash plus tard
        ];
    }
}