<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Vérifier si l'utilisateur est connecté et possède un rôle relié
        if (!$request->user() || !$request->user()->role) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé. Aucun rôle assigné.'
            ], 403);
        }

        // 2. Vérifier si le nom du rôle de l'utilisateur fait partie des rôles autorisés
        if (!in_array($request->user()->role->nom, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès interdit. Privilèges insuffisants pour ce rôle.'
            ], 403);
        }

        return $next($request);
    }
}