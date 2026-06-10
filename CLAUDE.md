# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lavoto** is a multi-tenant car wash SaaS with a decoupled architecture:

- `sever/` — Laravel 13 REST API backend (note: folder is intentionally named `sever`, not `server`)
- `client/` — React 19 + Vite SPA frontend

The two sides communicate over HTTP; the React app is **not** embedded in Laravel (Inertia is installed but unused for the actual UI).

---

## Backend (sever/)

### Setup

```bash
cd sever
cp .env.example .env
# Configure MySQL in .env:
# DB_HOST=127.0.0.1
# DB_DATABASE=lavoto
# DB_USERNAME=root
# DB_PASSWORD=yourpassword

php artisan key:generate
php artisan migrate
php artisan db:seed
```

Or use the composer shortcut (install + migrate + build in one):

```bash
composer run setup
```

### Dev server

```bash
# Starts Laravel (port 8000), queue worker, and Vite (Laravel assets) concurrently
composer run dev
```

### Tests

```bash
composer run test
# single test file:
php artisan test tests/Feature/ExampleTest.php
```

### Code style

```bash
./vendor/bin/pint      # Laravel Pint (PSR-12)
```

### Key dependencies

- **Laravel Sanctum** — token-based API auth (`HasApiTokens` on User); all protected routes use `auth:sanctum`
- **spatie/laravel-permission ^7** — roles & permissions with teams enabled (see Tenancy model below)
- **spatie/laravel-activitylog ^5** — audit log on Company, Station, User
- **Pest** — test framework

---

## Frontend (client/)

### Dev server

```bash
cd client
npm install
npm run dev     # Vite on http://localhost:5173
```

### Build & lint

```bash
npm run build
npm run lint    # ESLint
```

---

## Architecture & Key Patterns

### Tenancy model

Lavoto is multi-tenant. The top-level tenant is a **Company** row. Every domain table carries `company_id`.

**Tenant isolation — `BelongsToCompany` trait** (`app/Traits/BelongsToCompany.php`):  
Apply to every model with a `company_id` column. It installs a global Eloquent scope that automatically adds `WHERE company_id = {auth user's company_id}` to all queries.

- Unauthenticated requests: no scope (the `auth:sanctum` middleware handles the 401).
- Super-admin (`company_id = null`): scope is bypassed — sees all rows across all companies.
- Regular users: scoped to their own company only.

**Spatie permission team context — `SetPermissionsTeamContext` middleware** (`app/Http/Middleware/SetPermissionsTeamContext.php`):  
Appended to the `api` middleware group. After Sanctum resolves the user, it calls `setPermissionsTeamId($user->company_id ?? 0)` so that all `hasRole()` / `hasPermission()` checks are automatically scoped to the correct tenant. Super-admins use team id `0` (no real company).

**Registration bootstraps a company:**  
`POST /api/auth/register` creates both the Company and the first Admin user atomically. Subsequent users are added by that admin.

**Super-admin:**  
A user with `company_id = null`. Created via seeder only (`super@lavoto.com`). Not assignable via the API.

**Decision to revisit:** `email` is globally unique across all companies. If the same person must exist in two companies, this constraint needs relaxing.

### Roles (four, per-tenant)

| Role       | Key permissions                                   |
| ---------- | ------------------------------------------------- |
| `admin`    | all permissions                                   |
| `manager`  | company.view, stations.\*, users.view/create/edit |
| `employee` | stations.view, users.view                         |
| `customer` | none (booking permissions added in Phase 1)       |

Roles are global templates (no `company_id` on the role row itself). They are scoped per tenant at runtime via the Spatie teams feature (`team_foreign_key = company_id`).

### Middleware aliases (bootstrap/app.php)

| Alias          | Class                                                     |
| -------------- | --------------------------------------------------------- |
| `role`         | `Spatie\Permission\Middleware\RoleMiddleware`             |
| `permission`   | `Spatie\Permission\Middleware\PermissionMiddleware`       |
| `role_or_perm` | `Spatie\Permission\Middleware\RoleOrPermissionMiddleware` |

### API response shape

```json
{ "success": true|false, "data": ..., "message": "..." }
```

### API auth endpoints (Phase 0)

| Method | Path                 | Auth                             |
| ------ | -------------------- | -------------------------------- |
| POST   | `/api/auth/register` | public — creates company + admin |
| POST   | `/api/auth/login`    | public                           |
| POST   | `/api/auth/logout`   | sanctum                          |
| GET    | `/api/auth/me`       | sanctum                          |

### Database

Default is MySQL 8.0+. Configure credentials in `.env` after copying `.env.example`. Phase 0 seeder order: `RolePermissionSeeder` → `CompanySeeder` → `UserSeeder`.

Seed credentials:

- `super@lavoto.com` / `password` — super-admin (no company)
- `admin@lavoto-demo.com` / `password` — admin of "Lavoto Demo" company

### Models with soft deletes

`User`, `Company`, `Station` all use `SoftDeletes`.

### Frontend auth state (current limitation)

`App.jsx` manages auth state in local React state (`isLoggedIn`, `role`, `currentPage`). `react-router-dom` is installed but navigation is manual state switching. API calls use `fetch` directly against `http://localhost:8001/api`.

### Fallback data

Several frontend pages (e.g., `ClientReservation.jsx`) define inline `fallback*` arrays used when the API fetch fails — intentional for offline/dev resilience.
