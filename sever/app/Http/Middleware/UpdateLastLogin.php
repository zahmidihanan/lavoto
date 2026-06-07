<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastLogin
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            $request->user()->update([
                'last_login_at' => now(),
            ]);
        }

        return $next($request);
    }
}