# Lavoto — Multi-Tenant Car Wash SaaS

A decoupled full-stack SaaS platform for managing car wash businesses with multi-tenancy support, employee scheduling, customer bookings, and a public booking portal.

## Tech Stack

- **Backend**: Laravel 13 (REST API) in `sever/` folder
- **Frontend**: React 19 + Vite SPA in `client/` folder
- **Database**: MySQL 8.0+ (configurable)
- **Auth**: Laravel Sanctum (token-based API auth)
- **Permissions**: Spatie Laravel Permission with teams

## Quick Start

### Backend Setup

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
composer run dev    # Starts Laravel (8000), queue worker, and Vite
```

Or use the shortcut:
```bash
composer run setup
```

### Frontend Setup

```bash
cd client
cp .env.example .env
npm install
npm run dev    # Vite dev server on http://localhost:5173
```

### Seed Credentials

- **Super Admin**: `super@lavoto.com` / `password` (no company, views all tenants)
- **Company Admin**: `admin@lavoto-demo.com` / `password` (Lavoto Demo company)

## Core Features

### Multi-Tenancy (Phase 0)

- **Company** is the top-level tenant
- Every domain table carries `company_id`
- **BelongsToCompany** trait applies global Eloquent scope (`WHERE company_id = auth_user.company_id`)
- Super-admins (company_id = null) bypass the scope and see all data
- Roles and permissions are scoped per tenant via Spatie teams

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| `admin` | all operations |
| `manager` | stations, users, bookings |
| `employee` | view stations, own bookings |
| `customer` | none (booking-specific in Phase 1) |

### Public Booking Portal (Phase 1)

- Shareable URL per company: `/book/{slug}`
- Customers self-serve without login
- Real-time availability: shows unavailable time slots when all employees are booked
- Automatically creates user and customer profile on first booking
- Email uniqueness globally; customer profile per company

### Employee Workflow

1. Employee logs in → sees only their assigned bookings
2. **Start** button: transitions booking from `assigned` → `in_progress`
3. **Finish** button: transitions booking from `in_progress` → `completed`
4. Admin dashboard shows job cards with status and quick actions

### Admin Dashboard

- Assign employees to bookings
- Busy employees (already booked at same time) are greyed out
- View all bookings, filter by employee/status
- Share public portal link with customers

## Project Structure

```
sever/
├── app/
│   ├── Models/           # Eloquent models
│   ├── Controllers/Api/  # API endpoints
│   ├── Repositories/     # Data access layer
│   ├── Services/         # Business logic
│   ├── Requests/         # Form validation
│   ├── Policies/         # Authorization
│   └── Traits/           # Global scopes (BelongsToCompany)
├── routes/
│   └── api.php          # API routes (public + authenticated)
├── database/
│   ├── migrations/       # Schema
│   └── seeders/          # Test data
└── tests/                # Pest feature tests

client/
├── src/
│   ├── pages/           # Route components
│   │   ├── public/      # BookingPortal (no auth)
│   │   ├── admin/       # Admin dashboard & booking detail
│   │   ├── employee/    # Employee dashboard & bookings
│   │   └── customer/    # Customer bookings
│   ├── components/      # Reusable UI components
│   ├── api/             # API client (services.ts)
│   ├── stores/          # Zustand auth state
│   └── types/           # TypeScript types
└── vite.config.ts       # Build config
```

## API Endpoints

### Public (No Auth)

- `GET /api/public/{slug}` — Company info
- `GET /api/public/{slug}/services` — Services list
- `GET /api/public/{slug}/stations` — Stations list
- `GET /api/public/{slug}/availability` — Available time slots
- `POST /api/public/{slug}/book` — Create booking

### Authenticated (`auth:sanctum`)

**Auth**
- `POST /api/auth/register` — Create company + admin user
- `POST /api/auth/login` — Get token
- `POST /api/auth/logout` — Revoke token
- `GET /api/auth/me` — Current user

**Bookings**
- `GET /api/bookings` — List (filtered by employee if role=employee)
- `GET /api/bookings/{id}` — Detail
- `POST /api/bookings/{id}/status` — Change status
- `POST /api/bookings/{id}/assign-employees` — Assign to employees

**Employees**
- `GET /api/employees` — All employees
- `GET /api/employees/available?date=...&time=...` — Available at slot
- `POST /api/employees` — Create
- `PUT /api/employees/{id}` — Update

**Resources**
- Stations, Services, Customers, Vehicles, etc.

## State Machine — Bookings

```
pending → confirmed → assigned → in_progress → quality_check → completed
   ↓         ↓            ↓           ↓              ↓             ↓
 cancel    cancel       cancel      cancel        cancel         (end)
```

Admin transitions: `pending` → `confirmed` → `assigned` → `quality_check` → `completed`  
Employee shortcut: `in_progress` → `completed` (skips quality_check)

## Development

### Backend Tests

```bash
cd sever
composer run test              # All tests
php artisan test tests/Feature/ExampleTest.php  # Single file
```

### Linting

```bash
cd sever
./vendor/bin/pint            # Laravel Pint (PSR-12)

cd client
npm run lint                 # ESLint
```

### Build

```bash
cd client
npm run build    # Production bundle
```

## Key Architectural Decisions

1. **Decoupled frontend/backend**: React app communicates via HTTP, not Inertia
2. **Global email uniqueness**: User can book across companies with same email; customer profile is per-company
3. **Scope bypass**: `withoutGlobalScope('company')` for cross-tenant lookups (public portal, email search)
4. **Team context**: `setPermissionsTeamId()` after auth so role checks work per-tenant
5. **State exclusion**: When checking employee availability, exclude the current booking to allow reassignment
6. **Timezone handling**: All dates stored as `YYYY-MM-DD`, times as `HH:MM` (no timezone offset)

## Troubleshooting

**"Employees all show as Busy in admin assignment"**
- Ensure `exclude_booking_id` is passed to `/api/employees/available` so the current booking isn't counted as a conflict

**"(vehicles ?? []).map is not a function"**
- TanStack Query cache key collision. All uses of same key must return same shape; use `r.data` consistently

**"Validation errors show only 'Validation failed'"**
- Custom exception handler always returns generic `message`; read `errors` object for field-level details

**"Customer shows as '—' in bookings list"**
- `Customer::with('user')` needs `.withoutGlobalScope('company')` if user belongs to different company

## Next Phase Ideas

- Payment processing integration
- SMS/Email notifications
- Advanced reporting and analytics
- Queue optimization (minimize wait times)
- Rating system for customers
- Loyalty points and discounts
