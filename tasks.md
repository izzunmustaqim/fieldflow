# FieldFlow CRM — Implementation Tasks

## 1. Project Bootstrap ✅
- [x] Scaffold Laravel project with Breeze (React + Inertia stack)
- [x] Verify Tailwind CSS is active and compiling
- [x] Verify Inertia.js is wired correctly
- [x] Fix Vite 8 + @vitejs/plugin-react dependency conflict
- [x] Add missing bootstrap.js for axios CSRF setup
- [x] Confirm shadcn/ui is initialized (`@/components/ui/` directory exists)
- [x] Run default Breeze auth flow (register → login → dashboard) to confirm baseline works

## 2. Database & Models ✅
- [x] Configure PostgreSQL for production (SQLite for dev)
- [x] Create `customers` migration (`name`, `phone`, `email`, `address`, `timestamps`)
- [x] Create `work_orders` migration (`customer_id` FK → cascade delete, `title`, `description`, `status` enum, `scheduled_at`, `estimated_cost`, `timestamps`)
- [x] Define `Customer` model with `hasMany(WorkOrder)` relationship
- [x] Define `WorkOrder` model with `belongsTo(Customer)` relationship
- [x] Seed database with realistic test data (3+ customers, 5+ work orders across all statuses)

## 3. Customer CRUD ✅
- [x] Build `CustomerController` (index, store, update, destroy)
- [x] Define resource routes nested inside `auth` middleware in `routes/web.php`
- [x] Build `Customers/Index.jsx` page wrapped in `<AuthenticatedLayout>`
- [x] Implement customer list table (name, phone, email, address)
- [x] Implement create/edit customer modal or inline form
- [x] Implement delete customer with confirmation

## 4. Work Order CRUD ✅
- [x] Build `WorkOrderController` (index, store, update, destroy)
- [x] Define resource routes nested inside `auth` middleware in `routes/web.php`
- [x] Build `WorkOrders/Index.jsx` page wrapped in `<AuthenticatedLayout>`
- [x] Implement work order list table (title, customer, status, scheduled_at, estimated_cost)
- [x] Implement create/edit work order form (dropdown for customer, datetime picker, cost input)
- [x] Implement delete work order with confirmation

## 5. Work Order Status Workflow ✅
- [x] Implement status update endpoint (Inertia PUT/PATCH — no page reload)
- [x] Add optimistic UI: status badge updates instantly before server confirms
- [x] Color-code status badges: `scheduled` (blue), `in_progress` (amber), `completed` (green), `cancelled` (red)
- [x] Handle server-side validation errors gracefully (revert optimistic state)

## 6. Sidebar Navigation & Responsive Layout ✅
- [x] Replace top navbar with fixed sidebar layout (`AuthenticatedLayout.jsx`)
- [x] Add navigation links: Dashboard, Customers, Work Orders
- [x] Add user info & dropdown at bottom of sidebar
- [x] Implement mobile sidebar: slides in/out with hamburger menu + backdrop
- [x] Desktop sidebar always visible (`lg:` breakpoint), mobile sidebar hidden by default
- [x] Sticky top bar with page header and user dropdown
- [x] Verify dashboard renders correctly on desktop (≥1024px)
- [x] Verify dashboard renders correctly on mobile (≤640px)
- [x] Ensure tables are scrollable or stacked on small screens

## 7. Testing & Factories ✅
- [x] Create `CustomerFactory` and `WorkOrderFactory` for test data generation
- [x] Write `CustomerTest` — full CRUD feature tests (index, store, update, destroy)
- [x] Write `WorkOrderTest` — full CRUD feature tests (index, store, update, destroy)
- [x] Verify Breeze auth tests pass (Authentication, Registration, PasswordReset, etc.)
- [x] All tests pass with `php artisan test`

## 8. Project Infrastructure ✅
- [x] CLAUDE.md created with project conventions, architecture, and commands
- [x] AGENTS.md created with Laravel Boost guidelines
- [x] boost.json configured (MCP, skills, agent support)
- [x] design.md created with database schema and folder architecture
- [x] spec.md created with product specification and MVP scope
- [x] .env.example cleaned up — FieldFlow naming, organized sections, commented production defaults
- [x] README.md updated with project docs
- [x] Git init + initial commit
- [x] Project structure fixed (moved from nested fieldflow/ to root)
- [x] Pushed to GitHub (git@github.com:izzunmustaqim/fieldflow.git)

## 9. Docker & Deployment ✅
- [x] Multi-stage Dockerfile for development (Node + PHP)
- [x] Production Dockerfile with Nginx + PHP-FPM
- [x] docker-compose.yml for local development with PostgreSQL
- [x] docker-compose.prod.yml for production-like testing
- [x] Docker entrypoint scripts (dev + production)
- [x] .dockerignore for optimized builds
- [x] Nginx configuration for production (`docker/nginx/`)
- [x] .env.docker for Docker development environment
- [x] deploy.sh interactive deployment script
- [x] DEPLOYMENT.md — complete guide for Oracle Cloud Always Free ($0/month hosting)

## 10. Custom Dashboard ✅
- [x] Build custom `Dashboard/Index.jsx` replacing Breeze default
- [x] Create `DashboardController` with stats aggregation
- [x] Show summary stats: total customers, active work orders, completed this week, scheduled this week
- [x] Show upcoming scheduled work orders (next 7 days)
- [x] Show recent activity feed (latest 10 work orders with diffForHumans timestamps)
- [x] Quick actions section (View Customers, View Work Orders)
- [x] Stats cards link to relevant index pages

## 11. CI/CD Pipeline ✅
- [x] Create CI workflow (`.github/workflows/ci.yml`) — runs tests + Pint on PRs
- [x] Create CD workflow (`.github/workflows/deploy.yml`) — auto-deploy on merge to main
- [x] Document required GitHub secrets (`.github/SECRETS.md`)

---

## Upcoming

### 12. User Roles & Permissions
- [ ] Add `role` column to `users` table (`dispatcher`, `technician`)
- [ ] Create Role enum and add migration
- [ ] Restrict CRUD operations to dispatchers/admins
- [ ] Technicians: view-only assigned jobs + status updates
- [ ] Role-based middleware or policy checks

### 13. Work Order Assignment
- [ ] Add `assigned_user_id` FK to `work_orders`
- [ ] Create migration and update `WorkOrder` model
- [ ] Assign/unassign technicians to work orders
- [ ] Filter work orders by assigned technician
- [ ] Dashboard shows only assigned jobs for technicians

### 14. Search & Filtering
- [ ] Search customers by name, phone, or email
- [ ] Filter work orders by status, date range, or customer
- [ ] Sort tables by column headers
- [ ] Add query parameter persistence (bookmarkable filters)

### 15. Pagination & Data Integrity
- [ ] Implement Inertia/Laravel pagination on Index pages (Customers, Work Orders)
- [ ] Add SoftDeletes trait to Customer and WorkOrder models
- [ ] Create migration to add `deleted_at` column to both tables
- [ ] Update controllers to use `withTrashed()` where needed
- [ ] Add "Force Delete" option for admin users

### 16. Pre-Launch Tasks
- [ ] Set up mail driver (SMTP/Mailgun for password resets)
- [ ] Test password reset flow end-to-end
- [ ] Final responsive QA pass across all pages
- [ ] Create custom 404 error page
- [ ] Create custom 500 error page
- [ ] Optimize database queries (add indexes if needed)
- [ ] Verify all tests pass before deployment

### 17. Production Deployment (Oracle Cloud)
- [ ] Create Oracle Cloud Always Free account
- [ ] Provision Ubuntu VM (1GB RAM, Always Free eligible)
- [ ] Install Docker and Docker Compose on server
- [ ] Clone repository to server
- [ ] Generate app key (`php artisan key:generate`)
- [ ] Configure .env.production with secure credentials
- [ ] Run initial migrations (`php artisan migrate --force`)
- [ ] Seed database if needed (`php artisan db:seed`)
- [ ] Build and start Docker containers
- [ ] Configure firewall (allow ports 80, 443)
- [ ] Set up SSL with Let's Encrypt (if using domain)
- [ ] Configure automated database backups (daily cron job)
- [ ] Set up UptimeRobot monitoring (free tier)
- [ ] Test all features with real users
- [ ] Configure GitHub secrets (SERVER_HOST, SERVER_USER, SERVER_SSH_KEY)
- [ ] Test CI/CD pipeline end-to-end

### 18. Post-Deployment
- [ ] Document server access and credentials securely
- [ ] Set up daily automated database backups (cron job)
- [ ] Configure UptimeRobot monitoring (free tier)
- [ ] Verify SSL certificate auto-renewal

### 19. Future Enhancements (MVP+)
- [ ] File attachments/photos using Spatie Media Library for Work Orders
- [ ] Before/after photo uploads for field technicians
- [ ] Email notifications for job assignments and completions
- [ ] Notification preferences per user role

---

**📋 Recommended Order for Upcoming Work:**
1. Section 12 (User Roles) — Security critical, foundation for assignment
2. Section 13 (Work Order Assignment) — Core feature, builds on roles
3. Section 14 (Search & Filtering) — Polish, improves daily usability
4. Section 15 (Pagination & Data Integrity) — Performance for growing data
5. Section 16 (Pre-Launch) — Quality gates before going live
6. Section 17 (Deployment) — Deploy when core features are solid
7. Section 18 (Post-Deployment) — Finalize production setup
8. Section 19 (Future Enhancements) — Optional MVP+ features

**🏗️ Project Status:** Core MVP complete (Sections 1–11). Ready for role-based features and deployment prep.
