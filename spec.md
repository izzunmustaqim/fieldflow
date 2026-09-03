# Product Specification: FieldFlow CRM

## Core Purpose
A lightweight, mobile-first CRM and scheduling platform built for independent local field trade contractors (plumbers, electricians, HVAC technicians) to manage customers, track work orders, and update job statuses live from work sites.

## Target User Personas
1. **Dispatchers / Admins (Desktop Users):** Need a wide dashboard overview to schedule, view, and organize work orders across all customers.
2. **Technicians (Mobile Browser Users):** Need an ultra-clean, fast interface to see their assigned work orders and mark progress while on site.

## MVP Scope & Strict Requirements
- **Authentication:** User logins, registrations, profile management, and private dashboards via Laravel Breeze.
- **Data Architecture:** A relational ownership chain: `Users → Customers → Work Orders`.
- **Work Order Management:** Full CRUD for work orders with status transitions (scheduled → in_progress → completed/cancelled), scheduling, and cost tracking.
- **Customer Management:** Full CRUD for customer records with work order counts.
- **Dashboard:** Summary stats (total customers, active orders, completed this week, scheduled this week), upcoming scheduled orders (next 7 days), and recent activity feed.
- **UI Architecture:** Fully responsive dashboard using React + Inertia.js SPA with shadcn/ui component primitives.
- **Performance:** Instant, zero-refresh navigation powered by Inertia.js with server-side form validation.

## Data Architecture

### `users`
| Column | Type | Notes |
|---|---|---|
| id | integer | PK |
| name | varchar | |
| email | varchar | Unique |
| password | varchar | Hashed |
| email_verified_at | datetime | Nullable |
| created_at / updated_at | datetime | Timestamps |

### `customers`
| Column | Type | Notes |
|---|---|---|
| id | integer | PK |
| user_id | integer | FK → users.id |
| name | varchar | Required |
| email | varchar | Nullable |
| phone | varchar | Nullable |
| address | text | Nullable |
| notes | text | Nullable |
| created_at / updated_at | datetime | Timestamps |

### `work_orders`
| Column | Type | Notes |
|---|---|---|
| id | integer | PK |
| customer_id | integer | FK → customers.id |
| title | varchar | Required |
| description | text | Nullable |
| scheduled_at | datetime | Required |
| estimated_cost | numeric | Nullable |
| actual_cost | numeric | Nullable |
| status | varchar | Enum: `scheduled`, `in_progress`, `completed`, `cancelled` |
| created_at / updated_at | datetime | Timestamps |

## Pages & Routes
| Route | Page | Description |
|---|---|---|
| `/` | Welcome | Public landing page |
| `/login` | Auth/Login | Login form |
| `/register` | Auth/Register | Registration form |
| `/dashboard` | Dashboard | Stats cards, upcoming work orders, recent activity |
| `/customers` | Customers/Index | Customer list, create/edit/delete modals |
| `/work-orders` | WorkOrders/Index | Work order list, create/edit/delete modals, status updates |
| `/profile` | Profile/Edit | Profile info, password change, account deletion |

## Technical Constraints
- **Backend:** Laravel 13.30.1 / PHP 8.4
- **Frontend:** React 19.2 / Inertia.js 3.0 (react) / JSX (not TypeScript)
- **CSS:** Tailwind CSS v4.3 + shadcn/ui components
- **Database:** SQLite (dev)
- **Auth:** Laravel Breeze 2.4 (session-based)
- **Routing:** Ziggy 2.6 (named Laravel routes in JS)
- **Build Tool:** Vite 8.2 with `@vitejs/plugin-react`
- **Icons:** Lucide React
- **Forms:** Inertia `useForm` with server-side validation + `router.reload()` for zero-refresh updates
