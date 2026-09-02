# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FieldFlow CRM — a mobile-first CRM for field trade contractors (plumbers, electricians, HVAC). Two user roles: Dispatchers/Admins (desktop dashboard) and Technicians (mobile browser for job status updates).

## Tech Stack

- **Backend:** Laravel 13+ / PHP 8.3+
- **Frontend:** React 18.2 / Inertia.js 2.0+ / Tailwind CSS v4 / shadcn/ui
- **UI Primitives:** Base UI (`@base-ui/react`) — shadcn/ui uses Base UI, not Radix
- **Icons:** lucide-react
- **Font:** Geist Variable (`@fontsource-variable/geist`)
- **Auth:** Laravel Breeze (React + Inertia stack)
- **Build:** Vite 8 + `@vitejs/plugin-react` + `@tailwindcss/vite`
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

# Add shadcn/ui components (JSX, not TSX)
npx shadcn@latest add <component-name>
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

4. **Utility function for class merging:**
   ```jsx
   import { cn } from '@/lib/utils';
   // cn() wraps clsx + tailwind-merge for conditional class composition
   ```

### Database Schema (MVP)

```
users → customers (hasMany)
customers → jobs (hasMany, cascade delete)

Jobs status enum: scheduled | in_progress | completed | cancelled
```

### File Locations

- **Controllers:** `app/Http/Controllers/`
- **Models:** `app/Models/`
- **React Pages:** `resources/js/Pages/` (PascalCase, resolved by Inertia)
- **Breeze UI Components:** `resources/js/Components/` (capital C — Breeze default)
- **shadcn/ui Components:** `resources/js/components/ui/` (lowercase — shadcn default)
- **Utilities:** `resources/js/lib/utils.js` (exports `cn()` helper)
- **Layouts:** `resources/js/Layouts/`
- **Routes:** `routes/web.php` (main), `routes/auth.php` (Breeze auth)

## Conventions

- Use `Inertia::render()` from controllers, never `view()` or `response()->json()`
- Use `router.visit()` or `<Link>` for navigation — no full page reloads
- Status badges: `scheduled` (blue), `in_progress` (amber), `completed` (green), `cancelled` (red)
- Optimistic UI updates: update state immediately, revert on server error

## Tailwind CSS v4 Notes

Tailwind v4 uses CSS-based configuration — there is **no `tailwind.config.js`** or `postcss.config.js`. All configuration lives in `resources/css/app.css`:

- `@import "tailwindcss"` — replaces the old `@tailwind` directives
- `@theme inline { ... }` — defines design tokens (fonts, radii, colors) as CSS custom properties
- `@layer base { :root { ... } }` — sets light/dark mode CSS variables using oklch color format
- Vite plugin: `@tailwindcss/vite` handles compilation (no PostCSS config needed)

### Tailwind Color System

Colors use oklch format and are mapped via CSS variables. Available tokens: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`. Use these with Tailwind utility classes (e.g., `bg-primary`, `text-muted-foreground`).

## shadcn/ui Notes

- **Style:** `base-nova` (uses Base UI primitives, not Radix)
- **Format:** JSX (not TSX) — project is pure JavaScript, no TypeScript
- **Config:** `components.json` at project root
- **Adding components:** `npx shadcn@latest add <name>` — installs to `resources/js/components/ui/`
- **Existing component:** `Button` with variants (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`) and sizes (`default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`)
