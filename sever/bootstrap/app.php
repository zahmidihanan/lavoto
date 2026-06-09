<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role'         => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'   => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_perm' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'team.context' => \App\Http\Middleware\SetPermissionsTeamContext::class,
        ]);

        $middleware->appendToGroup('api', \App\Http\Middleware\SetPermissionsTeamContext::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {

        $json = fn($request) => $request->is('api/*') || $request->expectsJson();

        $exceptions->render(function (AuthenticationException $e, $request) use ($json) {
            if ($json($request)) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
            }
        });

        $exceptions->render(function (AuthorizationException $e, $request) use ($json) {
            if ($json($request)) {
                return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
            }
        });

        $exceptions->render(function (ValidationException $e, $request) use ($json) {
            if ($json($request)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors'  => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (ModelNotFoundException|NotFoundHttpException $e, $request) use ($json) {
            if ($json($request)) {
                return response()->json(['success' => false, 'message' => 'Resource not found.'], 404);
            }
        });

        $exceptions->render(function (MethodNotAllowedHttpException $e, $request) use ($json) {
            if ($json($request)) {
                return response()->json(['success' => false, 'message' => 'Method not allowed.'], 405);
            }
        });

    })->create();
