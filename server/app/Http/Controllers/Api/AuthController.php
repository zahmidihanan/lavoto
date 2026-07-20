<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AuthService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());
        return $this->created($result, 'Registration successful. Please verify your email.');
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());
        return $this->success($result, 'Login successful.');
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());
        return $this->noContent();
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['company', 'station', 'customer', 'employee']);
        return $this->success([
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'phone'             => $user->phone,
            'status'            => $user->status,
            'company_id'        => $user->company_id,
            'station_id'        => $user->station_id,
            'customer_id'       => $user->customer?->id,
            'employee_id'       => $user->employee?->id,
            'email_verified_at' => $user->email_verified_at,
            'last_login_at'     => $user->last_login_at,
            'is_super_admin'    => $user->isSuperAdmin(),
            'roles'             => $user->getRoleNames(),
            'permissions'       => $user->getAllPermissions()->pluck('name'),
            'company'           => $user->company ? ['id' => $user->company->id, 'name' => $user->company->name, 'slug' => $user->company->slug] : null,
            'station'           => $user->station ? ['id' => $user->station->id, 'name' => $user->station->name] : null,
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $result = $this->authService->refresh($request->user());
        return $this->success($result, 'Token refreshed.');
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->forgotPassword($request->validated('email'));
        return $this->success(null, 'Password reset link sent to your email.');
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword($request->validated());
        return $this->success(null, 'Password has been reset successfully.');
    }

    public function verifyEmail(Request $request, int $id, string $hash): JsonResponse
    {
        $user = \App\Models\User::findOrFail($id);

        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return $this->error('Invalid verification link.', 400);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->success(null, 'Email already verified.');
        }

        $user->markEmailAsVerified();
        return $this->success(null, 'Email verified successfully.');
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->hasVerifiedEmail()) {
            return $this->success(null, 'Email already verified.');
        }
        $user->sendEmailVerificationNotification();
        return $this->success(null, 'Verification email resent.');
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (isset($data['current_password']) && !\Hash::check($data['current_password'], $user->password)) {
            return $this->error('Current password is incorrect.', 422);
        }

        if (isset($data['password'])) {
            $data['password'] = \Hash::make($data['password']);
        }

        unset($data['current_password']);
        $user->update($data);

        return $this->success(['user' => $user->fresh()], 'Profile updated.');
    }
}
