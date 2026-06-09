<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly UserService $userService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);
        $paginator = $this->userService->paginate($request->all());
        return $this->paginated(UserResource::collection($paginator));
    }

    public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);
        $user->load(['company', 'station']);
        return $this->success(new UserResource($user));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);
        /** @var User $authUser */
        $authUser = request()->user();
        $data = array_merge($request->validated(), ['company_id' => $authUser->company_id]);
        $user = $this->userService->create($data, (string) $data['role']);
        return $this->created(new UserResource($user));
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);
        $updated = $this->userService->update($user, $request->validated());
        return $this->success(new UserResource($updated));
    }

    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);
        $this->userService->delete($user);
        return $this->noContent();
    }
}
