<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vehicle\StoreVehicleRequest;
use App\Http\Requests\Vehicle\UpdateVehicleRequest;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;
use App\Services\VehicleService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly VehicleService $vehicleService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Vehicle::class);
        $paginator = $this->vehicleService->paginate($request->all());
        return $this->paginated(VehicleResource::collection($paginator));
    }

    public function show(Vehicle $vehicle): JsonResponse
    {
        $this->authorize('view', $vehicle);
        $vehicle->load('customer');
        return $this->success(new VehicleResource($vehicle));
    }

    public function store(StoreVehicleRequest $request): JsonResponse
    {
        $this->authorize('create', Vehicle::class);
        /** @var \App\Models\User $authUser */
        $authUser = request()->user();
        $data = array_merge($request->validated(), ['company_id' => $authUser->company_id]);
        $vehicle = $this->vehicleService->create($data);
        return $this->created(new VehicleResource($vehicle));
    }

    public function update(UpdateVehicleRequest $request, Vehicle $vehicle): JsonResponse
    {
        $this->authorize('update', $vehicle);
        $updated = $this->vehicleService->update($vehicle, $request->validated());
        return $this->success(new VehicleResource($updated));
    }

    public function destroy(Vehicle $vehicle): JsonResponse
    {
        $this->authorize('delete', $vehicle);
        $this->vehicleService->delete($vehicle);
        return $this->noContent();
    }
}
