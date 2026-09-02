# FieldFlow CRM

A lightweight, mobile-first CRM and scheduling platform for independent local field trade contractors (plumbers, electricians, HVAC technicians).

## Features

- **Customer Management** — Create, edit, and delete customer records
- **Job Scheduling** — Schedule jobs with datetime and estimated costs
- **Live Status Updates** — Technicians update job status from the field (scheduled → in_progress → completed/cancelled)
- **Mobile-First UI** — Responsive dashboard for both desktop admins and mobile technicians
- **Zero-Refresh Navigation** — Inertia.js powers instant page transitions

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 13 / PHP 8.3+ |
| Frontend | React 18.2 / Inertia.js 2.0 |
| UI Components | shadcn/ui (base-nova style, Base UI primitives) |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Font | Geist Variable |
| Build | Vite 8 |
| Auth | Laravel Breeze |
| Database | SQLite |

## Getting Started

### Prerequisites

- PHP 8.3+
- Composer
- Node.js 18+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "FieldFlow CRM"

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate

# Build assets
npm run build
```

### Development

```bash
# Start backend server (terminal 1)
php artisan serve

# Start Vite dev server (terminal 2)
npm run dev
```

Open http://localhost:8000

## Project Structure

```
├── app/Http/Controllers/        # Request handling
├── app/Models/                  # Eloquent models (Customer, Job)
├── resources/js/Pages/          # React page components (Inertia)
├── resources/js/Components/     # Breeze default UI components
├── resources/js/components/ui/  # shadcn/ui components
├── resources/js/lib/            # Utilities (cn() helper)
├── resources/js/Layouts/        # Page layouts (AuthenticatedLayout)
├── routes/web.php               # Main routes
├── database/migrations/         # Database schema
└── resources/css/app.css        # Tailwind v4 config + design tokens
```

## Database Schema

```
users ──1:N──> customers ──1:N──> jobs

jobs.status: scheduled | in_progress | completed | cancelled
```

## License

MIT
