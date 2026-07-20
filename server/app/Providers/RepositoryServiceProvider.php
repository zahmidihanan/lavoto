<?php

namespace App\Providers;

use App\Repositories\BookingRepository;
use App\Repositories\Contracts\BookingRepositoryInterface;
use App\Repositories\Contracts\CouponRepositoryInterface;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use App\Repositories\Contracts\ServiceRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\VehicleRepositoryInterface;
use App\Repositories\CouponRepository;
use App\Repositories\CustomerRepository;
use App\Repositories\EmployeeRepository;
use App\Repositories\PaymentRepository;
use App\Repositories\ServiceRepository;
use App\Repositories\UserRepository;
use App\Repositories\VehicleRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $bindings = [
            UserRepositoryInterface::class     => UserRepository::class,
            CustomerRepositoryInterface::class => CustomerRepository::class,
            EmployeeRepositoryInterface::class => EmployeeRepository::class,
            VehicleRepositoryInterface::class  => VehicleRepository::class,
            ServiceRepositoryInterface::class  => ServiceRepository::class,
            BookingRepositoryInterface::class  => BookingRepository::class,
            PaymentRepositoryInterface::class  => PaymentRepository::class,
            CouponRepositoryInterface::class   => CouponRepository::class,
        ];

        foreach ($bindings as $abstract => $concrete) {
            $this->app->bind($abstract, $concrete);
        }
    }
}
