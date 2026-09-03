# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FieldFlow CRM — a mobile-first CRM for field trade contractors (plumbers, electricians, HVAC). Two user roles: Dispatchers/Admins (desktop dashboard) and Technicians (mobile browser for job status updates).

## Tech Stack

- **Backend:** Laravel 13+ / PHP 8.4+
- **Frontend:** React 19.2 / Inertia.js 3.0 / Tailwind CSS v4 / shadcn/ui
- **UI Primitives:** Base UI (`@base-ui/react`) — shadcn/ui uses Base UI, not Radix
- **Icons:** lucide-react
- **Font:** Geist Variable (`@fontsource-variable/geist`)
- **Auth:** Laravel Breeze (React + Inertia stack)
- **Build:** Vite 8 + `@vitejs/plugin-react` 6 + `@tailwindcss/vite`
- **Database:** SQLite (default), PostgreSQL (production), migrations in `database/migrations/`
- **Deployment:** Docker + Oracle Cloud Always Free ($0/month)
- **Docs:** See `DEPLOYMENT.md` for full deployment guide

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

# Docker Development
./deploy.sh                # Interactive deployment menu
docker compose up -d       # Start dev environment (app + PostgreSQL + Vite)
docker compose down        # Stop dev environment
docker compose logs -f     # View logs
docker compose exec app php artisan [cmd]  # Run artisan in container
docker compose exec app composer [cmd]     # Run composer in container

# Docker Production (local testing)
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Deployment
./deploy.sh                # Interactive menu (dev/prod/backup)
```

## Architecture

### Docker Setup

```
FieldFlow CRM (Docker)
├── app (PHP-FPM + Nginx)  → Port 80
├── postgres (PostgreSQL 16)
└── node (Vite dev server) → Port 5173
```

**Docker Files:**
- `Dockerfile` — Multi-stage build (dev)
- `Dockerfile.production` — Optimized with Nginx + PHP-FPM
- `docker-compose.yml` — Local development
- `docker-compose.prod.yml` — Production-like testing
- `deploy.sh` — Interactive deployment menu
- `DEPLOYMENT.md` — Complete Oracle Cloud guide

**Deployment:**
- **Hosting:** Oracle Cloud Always Free ($0/month)
- **Database:** PostgreSQL 16
- **CI/CD:** GitHub Actions (auto-deploy on merge to main)

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
customers → work_orders (hasMany, cascade delete)

WorkOrder status enum: scheduled | in_progress | completed | cancelled
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

===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application running on PHP 8.4. You are an expert with the Laravel ecosystem. Always use the APIs that match the installed major version of each package — do not assume a version.

Before relying on a package's API, confirm its installed version:
- PHP packages: run `composer show --direct` to list direct dependencies with versions, or `composer show <vendor/package>` for a single package.
- JS packages: check `package.json` for the installed versions.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Use `search-docs` before changes that depend on Laravel ecosystem APIs, behavior, configuration, or version-specific syntax. Skip it for copy-only edits and other changes where package documentation is irrelevant. Reuse sufficient results already in context instead of searching again.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- This project contains committed, area-grouped rules in `.ai/rules` when that directory exists (settled decisions, non-obvious traps, standing constraints). Framework and package guidelines that only apply to specific paths (testing, frontend, components) also live there, under `.ai/rules/boost` — this is not just recorded decisions, it is load-bearing guidance you have not seen inline. Before you enter plan mode or create/edit any file, you MUST first: open @.ai/rules/index.md (it maps file globs to rule files), read every rule file whose globs cover the path(s) in scope, and run `grep -rin 'keyword' .ai/rules` to catch what a path match alone misses. Do not write code until you have read and are following every matching rule. If `.ai/rules` does not exist, continue without it.
- Record durable rules with `record-rule` so the next agent or teammate inherits them instead of working them out again. Pass a `glob` (e.g. `app/Http/Controllers/**`), a short `title`, and a few-line `note`. Always use `record-rule`, never your native memory or notes tool — native memory is personal and session-scoped; only `.ai/rules` is shared with the team and persists in the repo.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Test every code change by adding or updating a test.
- Run the affected tests and ensure they pass.
- Test the changed behavior and its important failure modes, but do not add tests beyond them.
- Read the `testing-best-practices` skill before writing tests.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/Pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== phpunit/core rules ===

# PHPUnit

- This project uses PHPUnit. Create tests with `php artisan make:test --phpunit {name}`.
- Do not include the test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read the `testing-best-practices` skill for guidance on coverage, naming, structure, dependency isolation, and review.

## Running Tests

- Run the narrowest set of tests that covers the change. Pass a file path or `--filter=testName` to `php artisan test --compact`.
- Rerun a test after each change to it.
- Run `vendor/bin/phpunit` to call the test runner directly. It accepts the same file path and `--filter=testName` arguments.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>
