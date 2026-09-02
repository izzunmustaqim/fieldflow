# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FieldFlow CRM — a mobile-first CRM for field trade contractors (plumbers, electricians, HVAC). Two user roles: Dispatchers/Admins (desktop dashboard) and Technicians (mobile browser for job status updates).

## Tech Stack

- **Backend:** Laravel 13+ / PHP 8.3+
- **Frontend:** React 19+ / Inertia.js 3.0+ / Tailwind CSS v3
- **Auth:** Laravel Breeze (React + Inertia stack)
- **Build:** Vite 8
- **Database:** SQLite (default), migrations in `database/migrations/`

## Common Commands

```bash
# Development (run both servers)
php artisan serve          # Backend at :8000
npm run dev                # Vite at :5173

# Build
npm run build

# Tests
php artisan test
php artisan test --filter=AuthenticationTest   # single test

# Database
php artisan migrate:fresh --seed   # reset + seed

# Code style
./vendor/bin/pint          # Laravel Pint (PHP)
```

## Architecture

### Route → Controller → Inertia Page Flow

```
routes/web.php             → CustomerController::class
                           → returns Inertia::render('Customers/Index', $data)

resources/js/Pages/        → React components receiving Inertia props
```

### Key Patterns

1. **All authenticated routes nest inside `auth` middleware:**
   ```php
   Route::middleware('auth')->group(function () {
       Route::resource('customers', CustomerController::class);
   });
   ```

2. **Every page wraps in `<AuthenticatedLayout>`:**
   ```jsx
   import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
   export default function Page({ auth, data }) {
       return (
           <AuthenticatedLayout header={<h2>Page</h2>}>
               {/* content */}
           </AuthenticatedLayout>
       );
   }
   ```

3. **Shared Inertia props** (via `HandleInertiaRequests` middleware):
   - `auth.user` — current authenticated user object

### Database Schema (MVP)

```
users → customers (hasMany)
customers → jobs (hasMany, cascade delete)

Jobs status enum: scheduled | in_progress | completed | cancelled
```

### File Locations

- **Controllers:** `app/Http/Controllers/`
- **Models:** `app/Models/`
- **React Pages:** `resources/js/Pages/`
- **UI Components:** `resources/js/Components/`
- **Layouts:** `resources/js/Layouts/`
- **Routes:** `routes/web.php` (main), `routes/auth.php` (Breeze auth)

## Conventions

- Use `Inertia::render()` from controllers, never `view()` or `response()->json()`
- Use `router.visit()` or `<Link>` for navigation — no full page reloads
- Status badges: `scheduled` (blue), `in_progress` (amber), `completed` (green), `cancelled` (red)
- Optimistic UI updates: update state immediately, revert on server error
