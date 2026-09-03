# Technical Design System: FieldFlow CRM

> Mobile-first CRM for field trade contractors (plumbers, electricians, HVAC).
> Two roles: Dispatchers/Admins (desktop dashboard) and Technicians (mobile browser for job status updates).

---

## Database Design

### `users` Table (Laravel Breeze Default)
- `id` (Primary Key, bigIncrements)
- `name` (string)
- `email` (string, unique)
- `email_verified_at` (dateTime, nullable)
- `password` (string)
- `remember_token` (string, nullable)
- `timestamps`

### `customers` Table
- `id` (Primary Key, bigIncrements)
- `user_id` (foreignId, constrained to `users.id`, cascade delete)
- `name` (string)
- `email` (string, nullable)
- `phone` (string, nullable)
- `address` (text, nullable)
- `notes` (text, nullable)
- `timestamps`
> Core entity representing a homeowner or business requesting field service. Scoped to the authenticated user via `user_id`.

### `work_orders` Table
- `id` (Primary Key, bigIncrements)
- `customer_id` (foreignId, constrained to `customers.id`, cascade delete)
- `title` (string)
- `description` (text, nullable)
- `scheduled_at` (dateTime)
- `estimated_cost` (decimal 10,2, nullable)
- `actual_cost` (decimal 10,2, nullable)
- `status` (string, default: `scheduled`)
- `timestamps`
> Represents a discrete service call. Cascade-deletes with its parent customer. Access is controlled by traversing the `customer.user_id` relationship.

### Relationships
```
users → customers (hasMany via user_id)
customers → work_orders (hasMany via customer_id, cascade delete)
```

### Status Enum
`scheduled` | `in_progress` | `completed` | `cancelled`

---

## Folder Architecture & Conventions

```
app/
├── Http/
│   └── Controllers/
│       ├── Auth/                    ← Breeze auth controllers
│       ├── CustomerController.php
│       ├── DashboardController.php  ← Dashboard stats (invokable)
│       ├── ProfileController.php    ← Breeze profile
│       └── WorkOrderController.php
├── Models/
│   ├── Customer.php
│   ├── User.php                     ← hasMany customers
│   └── WorkOrder.php
└── ...

resources/
├── js/
│   ├── Components/                  ← Breeze UI components (Modal, Button, etc.)
│   ├── Layouts/
│   │   └── AuthenticatedLayout.jsx  ← Global shell: nav + CSRF
│   ├── Pages/
│   │   ├── Auth/                    ← Login, Register, ForgotPassword, etc.
│   │   ├── Customers/
│   │   │   └── Index.jsx            ← CRUD via modal dialogs
│   │   ├── Dashboard.jsx            ← Stats + upcoming + recent activity
│   │   ├── Profile/
│   │   │   ├── Edit.jsx
│   │   │   └── Partials/
│   │   ├── Welcome.jsx              ← Public landing (unauthenticated)
│   │   └── WorkOrders/
│   │       └── Index.jsx            ← CRUD via modal dialogs
│   ├── components/
│   │   └── ui/                      ← shadcn/ui primitives (Base UI style)
│   └── lib/
│       └── utils.js                 ← cn() helper (clsx + tailwind-merge)
├── css/
│   └── app.css                      ← Tailwind v4 config (@theme, @layer base)
└── ...

routes/
├── web.php                          ← All app routes (Breeze + customer/work-order/dashboard)
└── auth.php                         ← Breeze auth routes
```

### Route Definitions
```php
Route::get('/', fn () => Inertia::render('Welcome', [...]));
Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified']);

Route::middleware('auth')->group(function () {
    // Profile (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);

    // CRUD resources (except show/edit/create — inline modals only)
    Route::resource('customers', CustomerController::class)->except(['show', 'edit', 'create']);
    Route::resource('work-orders', WorkOrderController::class)->except(['show', 'edit', 'create']);
});
```

---

## Component Composability

### AuthenticatedLayout Wrapper Rule
Every custom page component **must** import and wrap its full visual output inside Breeze's `<AuthenticatedLayout>` component.

```jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function PageName({ prop1, prop2 }) {
    return (
        <AuthenticatedLayout header={<h2>Page Name</h2>}>
            <Head title="Page Name" />
            {/* Page content here */}
        </AuthenticatedLayout>
    );
}
```

### Modal Pattern
CRUD operations use inline modal dialogs (not separate pages). The `Modal` component is imported from `@/Components/Modal` (Breeze). Each page manages its own modal state with `useState`.

```jsx
import Modal from '@/Components/Modal';
const [showModal, setShowModal] = useState(false);

<Modal show={showModal} onClose={() => setShowModal(false)}>
    <form onSubmit={handleSubmit}>...</form>
</Modal>
```

### Form Handling
Forms use Inertia's `useForm` hook for validation, processing state, and automatic server requests.

```jsx
import { useForm } from '@inertiajs/react';
const form = useForm({ field: '' });
form.post(route('resource.store'), { onSuccess: () => { /* cleanup */ } });
```

---

## Authorization Pattern

Controllers verify resource ownership via the `user_id` → `customer.user_id` chain:

```php
// Customer ownership
protected function authorize(Customer $customer): void {
    if ($customer->user_id !== auth()->id()) {
        abort(403);
    }
}

// WorkOrder ownership (traverse through customer)
protected function authorizeWorkOrder(Request $request, WorkOrder $workOrder): void {
    $workOrder->load('customer');
    if ($workOrder->customer->user_id !== $request->user()->id()) {
        abort(403);
    }
}
```

---

## Dashboard

The `DashboardController` (invokable) provides summary stats via `Inertia::render('Dashboard', [...])`:

- **Stats:** total customers, active (in_progress) work orders, completed this week, scheduled this week
- **Upcoming Work Orders:** next 7 days, limited to 5, eager-loaded with customer
- **Recent Activity:** latest 10 work orders, ordered by `updated_at` desc

---

## Docker Infrastructure

### Services
| Service | Purpose | Port |
|---------|---------|------|
| `app` | PHP-FPM + Nginx | 80 |
| `postgres` | PostgreSQL 16 | 5432 (internal) |
| `node` | Vite dev server | 5173 |

### Docker Files
| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build for local development |
| `Dockerfile.production` | Optimized production build with Nginx + PHP-FPM |
| `docker-compose.yml` | Local development (app + PostgreSQL + Vite) |
| `docker-compose.prod.yml` | Production-like testing |
| `deploy.sh` | Interactive deployment menu (dev/prod/backup) |
| `DEPLOYMENT.md` | Complete Oracle Cloud deployment guide |

### Deployment
- **Hosting:** Oracle Cloud Always Free ($0/month)
- **Database:** PostgreSQL 16
- **CI/CD:** GitHub Actions (auto-deploy on merge to main)

---

## Key Technical Constraints

| Layer | Technology |
|-------|------------|
| Backend | Laravel 13+ / PHP 8.4+ |
| Frontend | React 19+ |
| SPA Bridge | Inertia.js 3.0+ |
| CSS | Tailwind CSS v4+ (CSS-based config, no tailwind.config.js) |
| UI Library | shadcn/ui (Base UI style, not Radix) |
| Icons | lucide-react |
| Font | Geist Variable (`@fontsource-variable/geist`) |
| Build | Vite 8 + `@vitejs/plugin-react` 6 + `@tailwindcss/vite` |
| Database | SQLite (dev default) / PostgreSQL (production) |
| Deployment | Docker + Oracle Cloud Always Free ($0/month) |
| Performance | Zero-refresh navigation (Inertia) + optimistic status updates |

---

## Conventions

- **Inertia only:** Use `Inertia::render()` from controllers, never `view()` or `response()->json()`
- **Navigation:** `router.visit()` or `<Link>` — no full page reloads
- **Status badges:** `scheduled` (blue), `in_progress` (amber), `completed` (green), `cancelled` (red)
- **Optimistic UI:** Update state immediately, revert on server error
- **File naming:** React pages in PascalCase, components in PascalCase, Breeze components use capital C (`@/Components/`), shadcn uses lowercase (`@/components/ui/`)
- **Utility:** `cn()` from `@/lib/utils` for class merging (clsx + tailwind-merge)
