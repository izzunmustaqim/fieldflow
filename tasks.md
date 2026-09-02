# FieldFlow CRM — Implementation Tasks

## 1. Project Bootstrap
- [ ] Scaffold Laravel project with Breeze (React + Inertia stack)
- [ ] Verify Tailwind CSS v4+ is active and compiling
- [ ] Verify Inertia.js 3.0+ is wired correctly
- [ ] Confirm shadcn/ui is initialized (`@/components/ui/` directory exists)
- [ ] Run default Breeze auth flow (register → login → dashboard) to confirm baseline works

## 2. Database & Models
- [ ] Create `customers` migration (`name`, `phone`, `email`, `address`, `timestamps`)
- [ ] Create `jobs` migration (`customer_id` FK → cascade delete, `title`, `description`, `status` enum, `scheduled_at`, `estimated_cost`, `timestamps`)
- [ ] Define `Customer` model with `hasMany(Job)` relationship
- [ ] Define `Job` model with `belongsTo(Customer)` relationship
- [ ] Seed database with realistic test data (3+ customers, 5+ jobs across all statuses)

## 3. Customer CRUD
- [ ] Build `CustomerController` (index, store, update, destroy)
- [ ] Define resource routes nested inside `auth` middleware in `routes/web.php`
- [ ] Build `Customers/Index.jsx` page wrapped in `<AuthenticatedLayout>`
- [ ] Implement customer list table (name, phone, email, address)
- [ ] Implement create/edit customer modal or inline form
- [ ] Implement delete customer with confirmation

## 4. Job CRUD
- [ ] Build `JobController` (index, store, update, destroy)
- [ ] Define resource routes nested inside `auth` middleware in `routes/web.php`
- [ ] Build `Jobs/Index.jsx` page wrapped in `<AuthenticatedLayout>`
- [ ] Implement job list table (title, customer, status, scheduled_at, estimated_cost)
- [ ] Implement create/edit job form (dropdown for customer, datetime picker, cost input)
- [ ] Implement delete job with confirmation

## 5. Job Status Workflow
- [ ] Implement status update endpoint (Inertia PUT/PATCH — no page reload)
- [ ] Add optimistic UI: status badge updates instantly before server confirms
- [ ] Color-code status badges: `scheduled` (blue), `in_progress` (amber), `completed` (green), `cancelled` (red)
- [ ] Handle server-side validation errors gracefully (revert optimistic state)

## 6. Responsive Layout
- [ ] Verify dashboard renders correctly on desktop (≥1024px)
- [ ] Verify dashboard renders correctly on mobile (≤640px)
- [ ] Ensure nav/shell from `<AuthenticatedLayout>` is fully responsive
- [ ] Ensure tables are scrollable or stacked on small screens

## 7. Polish & QA
- [ ] Confirm all routes are protected by Breeze `auth` middleware (unauthenticated → redirect to login)
- [ ] Test full flow: login → create customer → create job → update status → delete
- [ ] Verify cascade delete: deleting a customer removes its jobs
- [ ] Verify zero-refresh navigation across all pages (Inertia)
- [ ] Clean up any unused imports, components, or routes
