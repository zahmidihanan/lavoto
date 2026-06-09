<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\StoreServiceRequest;
use App\Http\Requests\Service\UpdateServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Services\ServiceService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ServiceService $serviceService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Service::class);
        $paginator = $this->serviceService->paginate($request->all());
        return $this->paginated(ServiceResource::collection($paginator));
    }

    public function active(): JsonResponse
    {
        $services = $this->serviceService->active();
        return $this->success(ServiceResource::collection($services));
    }

    public function show(Service $service): JsonResponse
    {
        $this->authorize('view', $service);
        return $this->success(new ServiceResource($service));
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $this->authorize('create', Service::class);
        /** @var \App\Models\User $authUser */
        $authUser = $request->user();
        $data = array_merge($request->validated(), ['company_id' => $authUser->company_id]);
        $service = $this->serviceService->create($data);
        return $this->created(new ServiceResource($service));
    }

    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        $this->authorize('update', $service);
        $updated = $this->serviceService->update($service, $request->validated());
        return $this->success(new ServiceResource($updated));
    }

    public function destroy(Service $service): JsonResponse
    {
        $this->authorize('delete', $service);
        $this->serviceService->delete($service);
        return $this->noContent();
    }
}
