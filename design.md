# Technical Design System: FieldFlow CRM

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
- `name` (string)
- `phone` (string)
- `email` (string, nullable)
- `address` (string)
- `timestamps`
> Core entity representing a homeowner or business requesting field service.

### `work_orders` Table
- `id` (Primary Key, bigIncrements)
- `customer_id` (foreignId, constrained to `customers.id`, cascade delete)
- `title` (string)
- `description` (text, nullable)
- `status` (enum: `scheduled`, `in_progress`, `completed`, `cancelled`, default: `scheduled`)
- `scheduled_at` (dateTime)
- `estimated_cost` (decimal 10,2)
- `timestamps`
> Represents a discrete service call. Cascade-deletes with its parent customer.

---

## Folder Architecture & Conventions

```
app/
├── Http/
│   └── Controllers/
│       ├── CustomerController.php
│       └── WorkOrderController.php
├── Models/
│   ├── Customer.php
│   └── WorkOrder.php
└── ...

resources/
├── js/
│   └── Pages/
│       ├── Customers/
│       │   └── Index.jsx
│       └── WorkOrders/
│           └── Index.jsx
├── components/
│   └── ui/           ← shadcn/ui primitives (Button, Card, Badge, etc.)
└── ...

routes/
└── web.php           ← All job & customer routes strictly nested inside Breeze auth middleware
```

### Route Nesting Requirement
All customer and work order routes **must** be nested inside Laravel Breeze's `auth` middleware group to guarantee authenticated access only.

```php
Route::middleware('auth')->group(function () {
    Route::resource('customers', CustomerController::class);
    Route::resource('work-orders', WorkOrderController::class);
});
```

---

## Component Composability

### AuthenticatedLayout Wrapper Rule
Every custom page component **must** import and wrap its full visual output inside Breeze's `<AuthenticatedLayout>` component.

```jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function WorkOrdersIndex({ workOrders }) {
    return (
        <AuthenticatedLayout header={<h2>Work Orders</h2>}>
            {/* Page content here */}
        </AuthenticatedLayout>
    );
}
```

This preserves:
- Uniform global top navigation
- Authenticated user session headers / CSRF tokens
- Consistent page shell across all views

---

## Key Technical Constraints

| Layer       | Technology              |
|-------------|-------------------------|
| Backend     | Laravel 13+ / PHP 8.4+  |
| Frontend    | React 19+               |
| SPA Bridge  | Inertia.js 3.0+         |
| CSS         | Tailwind CSS v4+        |
| UI Library  | shadcn/ui components    |
| Performance | Zero-refresh navigation (Inertia) + optimistic status updates |
