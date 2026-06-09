<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{
    protected function success(mixed $data = null, string $message = '', int $status = 200): JsonResponse
    {
        $payload = ['success' => true];
        if ($message)  $payload['message'] = $message;
        if ($data !== null) $payload['data'] = $data;
        return response()->json($payload, $status);
    }

    protected function created(mixed $data = null, string $message = 'Created.'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    protected function noContent(): JsonResponse
    {
        return response()->json(['success' => true], 204);
    }

    protected function error(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        $payload = ['success' => false, 'message' => $message];
        if ($errors) $payload['errors'] = $errors;
        return response()->json($payload, $status);
    }

    protected function paginated(mixed $resource): JsonResponse
    {
        $data = $resource->resource;
        return response()->json([
            'success' => true,
            'data'    => $resource,
            'meta'    => [
                'current_page' => $data->currentPage(),
                'last_page'    => $data->lastPage(),
                'per_page'     => $data->perPage(),
                'total'        => $data->total(),
            ],
        ]);
    }
}
