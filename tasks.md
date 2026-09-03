# FieldFlow CRM — Implementation Tasks

## 1. Project Bootstrap
- [x] Scaffold Laravel project with Breeze (React + Inertia stack)
- [x] Verify Tailwind CSS is active and compiling
- [x] Verify Inertia.js is wired correctly
- [x] Fix Vite 8 + @vitejs/plugin-react dependency conflict
- [x] Add missing bootstrap.js for axios CSRF setup
- [x] Confirm shadcn/ui is initialized (`@/components/ui/` directory exists)
- [x] Run default Breeze auth flow (register → login → dashboard) to confirm baseline works

## 2. Database & Models
- [x] Configure PostgreSQL for production (SQLite for dev)
- [x] Create `customers` migration (`name`, `phone`, `email`, `address`, `timestamps`)
- [x] Create `work_orders` migration (`customer_id` FK → cascade delete, `title`, `description`, `status` enum, `scheduled_at`, `estimated_cost`, `timestamps`)
- [x] Define `Customer` model with `hasMany(WorkOrder)` relationship
- [x] Define `WorkOrder` model with `belongsTo(Customer)` relationship
- [x] Seed database with realistic test data (3+ customers, 5+ work orders across all statuses)

## 3. Customer CRUD
- [x] Build `CustomerController` (index, store, update, destroy)
- [x] Define resource routes nested inside `auth` middleware in `routes/web.php`
- [x] Build `Customers/Index.jsx` page wrapped in `<AuthenticatedLayout>`
- [x] Implement customer list table (name, phone, email, address)
- [x] Implement create/edit customer modal or inline form
- [x] Implement delete customer with confirmation

## 4. Work Order CRUD
- [x] Build `WorkOrderController` (index, store, update, destroy)
- [x] Define resource routes nested inside `auth` middleware in `routes/web.php`
- [x] Build `WorkOrders/Index.jsx` page wrapped in `<AuthenticatedLayout>`
- [x] Implement work order list table (title, customer, status, scheduled_at, estimated_cost)
- [x] Implement create/edit work order form (dropdown for customer, datetime picker, cost input)
- [x] Implement delete work order with confirmation

## 5. Work Order Status Workflow
- [x] Implement status update endpoint (Inertia PUT/PATCH — no page reload)
- [x] Add optimistic UI: status badge updates instantly before server confirms
- [x] Color-code status badges: `scheduled` (blue), `in_progress` (amber), `completed` (green), `cancelled` (red)
- [x] Handle server-side validation errors gracefully (revert optimistic state)

## 6. Sidebar Navigation & Responsive Layout
- [x] Replace top navbar with fixed sidebar layout (`AuthenticatedLayout.jsx`)
- [x] Add navigation links: Dashboard, Customers, Work Orders
- [x] Add user info & dropdown at bottom of sidebar
- [x] Implement mobile sidebar: slides in/out with hamburger menu + backdrop
- [x] Desktop sidebar always visible (`lg:` breakpoint), mobile sidebar hidden by default
- [x] Sticky top bar with page header and user dropdown
- [x] Verify dashboard renders correctly on desktop (≥1024px)
- [x] Verify dashboard renders correctly on mobile (≤640px)
- [x] Ensure tables are scrollable or stacked on small screens

## 7. Polish & QA
- [x] Confirm all routes are protected by Breeze `auth` middleware (unauthenticated → redirect to login)
- [x] Test full flow: login → create customer → create work order → update status → delete
- [x] Verify cascade delete: deleting a customer removes its work orders
- [x] Verify zero-refresh navigation across all pages (Inertia)
- [x] Clean up any unused imports, components, or routes

## Completed
- [x] Git init + initial commit
- [x] Laravel 13 + Breeze React scaffolded
- [x] CLAUDE.md created with project conventions
- [x] README.md updated with project docs
- [x] Project structure fixed (moved from nested fieldflow/ to root)
- [x] Pushed to GitHub (git@github.com:izzunmustaqim/fieldflow.git)
