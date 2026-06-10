<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Services\EmployeeService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly EmployeeService $employeeService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Employee::class);
        $paginator = $this->employeeService->paginate($request->all());
        return $this->paginated(EmployeeResource::collection($paginator));
    }

    public function show(Employee $employee): JsonResponse
    {
        $this->authorize('view', $employee);
        $employee->load(['user', 'station']);
        return $this->success(new EmployeeResource($employee));
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $this->authorize('create', Employee::class);
        /** @var \App\Models\User $authUser */
        $authUser = request()->user();
        $data = array_merge($request->validated(), ['company_id' => $authUser->company_id]);
        $employee = $this->employeeService->create($data);
        return $this->created(new EmployeeResource($employee->load(['user', 'station'])));
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $this->authorize('update', $employee);
        $updated = $this->employeeService->update($employee, $request->validated());
        return $this->success(new EmployeeResource($updated->load(['user', 'station'])));
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $this->authorize('delete', $employee);
        $this->employeeService->delete($employee);
        return $this->noContent();
    }

    public function available(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Employee::class);
        $excludeBookingId = $request->query('exclude_booking_id')
            ? (int) $request->query('exclude_booking_id')
            : null;

        $employees = $this->employeeService->availableForStation(
            $request->query('station_id'),
            $request->query('date'),
            $request->query('time'),
            $excludeBookingId,
        );
        return $this->success(EmployeeResource::collection($employees));
    }
}
