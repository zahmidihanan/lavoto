<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Station\StoreStationRequest;
use App\Http\Requests\Station\UpdateStationRequest;
use App\Http\Resources\StationResource;
use App\Models\Station;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StationController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $search   = $request->input('search');
        $stations = Station::query()
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(StationResource::collection($stations));
    }

    public function show(Station $station): JsonResponse
    {
        return $this->success(new StationResource($station));
    }

    public function store(StoreStationRequest $request): JsonResponse
    {
        $this->authorize('create', Station::class);
        /** @var \App\Models\User $authUser */
        $authUser = request()->user();
        $data = array_merge($request->validated(), [
            'company_id' => $authUser->company_id,
            'status'     => $request->input('status', 'active'),
        ]);
        $station = Station::create($data);
        return $this->created(new StationResource($station));
    }

    public function update(UpdateStationRequest $request, Station $station): JsonResponse
    {
        $this->authorize('update', $station);
        $station->update($request->validated());
        return $this->success(new StationResource($station));
    }

    public function destroy(Station $station): JsonResponse
    {
        $this->authorize('delete', $station);
        $station->delete();
        return $this->noContent();
    }
}
