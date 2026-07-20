<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Company;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
class AuthService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepo,
    ) {}

    public function register(array $data): array
    {
        $company = Company::create([
            'name'   => $data['company_name'],
            'slug'   => Str::slug($data['company_name']) . '-' . Str::random(5),
            'status' => 'active',
        ]);

        setPermissionsTeamId($company->id);

        $user = User::create([
            'name'       => $data['name'],
            'email'      => $data['email'],
            'phone'      => $data['phone'] ?? null,
            'password'   => Hash::make($data['password']),
            'company_id' => $company->id,
            'status'     => 'active',
        ]);

        $user->assignRole('admin');

        event(new Registered($user));

        $user->load('company');
        return [
            'token' => $user->createToken('lavoto_auth')->plainTextToken,
            'user'  => $this->serializeUser($user),
        ];
    }

    public function login(array $credentials): array
    {
        $user = $this->userRepo->findByEmail($credentials['email']);

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw new ApiException('Invalid credentials.', 401);
        }

        if ($user->status === 'inactive' || $user->status === 'suspended') {
            throw new ApiException('Your account has been suspended.', 403);
        }

        $user->update(['last_login_at' => now()]);
        setPermissionsTeamId($user->company_id ?? 0);

        $user->load('company', 'station');
        return [
            'token' => $user->createToken('lavoto_auth')->plainTextToken,
            'user'  => $this->serializeUser($user),
        ];
    }

    private function serializeUser(User $user): array
    {
        $user->loadMissing(['customer', 'employee']);
        return array_merge($user->toArray(), [
            'roles'       => $user->getRoleNames()->toArray(),
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            'customer_id' => $user->customer?->id,
            'employee_id' => $user->employee?->id,
        ]);
    }

    public function logout(User $user): void
    {
        /** @var \Laravel\Sanctum\PersonalAccessToken $token */
        $token = $user->currentAccessToken();
        $token->delete();
    }

    public function refresh(User $user): array
    {
        /** @var \Laravel\Sanctum\PersonalAccessToken $token */
        $token = $user->currentAccessToken();
        $token->delete();
        return ['token' => $user->createToken('lavoto_auth')->plainTextToken];
    }

    public function forgotPassword(string $email): string
    {
        $status = Password::sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw new ApiException('Unable to send reset link. Please verify your email.', 422);
        }

        return $status;
    }

    public function resetPassword(array $data): void
    {
        $status = Password::reset($data, function (User $user, string $password) {
            $user->forceFill(['password' => Hash::make($password)])
                ->setRememberToken(Str::random(60));
            $user->save();
            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw new ApiException('Invalid or expired reset token.', 422);
        }
    }
}
