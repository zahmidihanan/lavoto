<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sets the Spatie permission team context to the authenticated user's company_id.
 * Must run after auth:sanctum so the user is resolved.
 * Super-admins (company_id = null) use team id 0, which matches no real company
 * so their roles are global and bypass per-tenant role checks.
 */
class SetPermissionsTeamContext
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($user = $request->user()) {
            setPermissionsTeamId($user->company_id ?? 0);
        }

        return $next($request);
    }
}
