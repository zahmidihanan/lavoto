<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * Adds a global scope that auto-filters queries to the authenticated user's company.
 * Super-admins (company_id = null) bypass the scope and see all rows.
 *
 * Apply to every domain model that carries a company_id column.
 */
trait BelongsToCompany
{
    public static function bootBelongsToCompany(): void
    {
        static::addGlobalScope('company', function (Builder $query) {
            $user = auth()->user();

            if (! $user) {
                return; // unauthenticated — auth middleware handles the 401
            }

            if ($user->company_id === null) {
                return; // super-admin sees everything
            }

            $query->where($query->getModel()->getTable() . '.company_id', $user->company_id);
        });
    }

    /**
     * Temporarily bypass the tenant scope for the duration of the callback.
     * Useful for cross-company admin operations.
     */
    public static function withoutTenantScope(callable $callback): mixed
    {
        return static::withoutGlobalScope('company')->tap(fn() => $callback());
    }
}
