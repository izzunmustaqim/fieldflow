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
| Backend | Laravel 13 / PHP 8.4+ |
| Frontend | React 19.2 / Inertia.js 3.0 |
| UI Components | shadcn/ui (base-nova style, Base UI primitives) |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Font | Geist Variable |
| Build | Vite 8 |
| Auth | Laravel Breeze |
| Database | SQLite (dev) / PostgreSQL (production) |
| Deployment | Docker + Oracle Cloud Always Free |
| CI/CD | GitHub Actions |

## Getting Started

### Option 1: Docker (Recommended)

**Prerequisites:**
- Docker Desktop
- Docker Compose

**Quick Start:**
```bash
# Clone repository
git clone https://github.com/izzunmustaqim/fieldflow.git
cd fieldflow

# Start development environment
./deploy.sh
# Select option 1 (Local Development)

# Or manually:
docker compose up -d

# Install dependencies (first time only)
docker compose exec app composer install
docker compose exec node npm install

# Generate app key
docker compose exec app php artisan key:generate

# Run migrations
docker compose exec app php artisan migrate

# Seed database (optional)
docker compose exec app php artisan db:seed
```

**Access:**
- App: http://localhost:8000
- Vite Dev Server: http://localhost:5173

### Option 2: Manual Setup

**Prerequisites:**
- PHP 8.4+
- Composer
- Node.js 18+

**Installation:**
```bash
# Clone the repository
git clone https://github.com/izzunmustaqim/fieldflow.git
cd fieldflow

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

**Development:**
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
├── app/Models/                  # Eloquent models (Customer, WorkOrder)
├── resources/js/Pages/          # React page components (Inertia)
├── resources/js/Components/     # Breeze default UI components
├── resources/js/components/ui/  # shadcn/ui components
├── resources/js/lib/            # Utilities (cn() helper)
├── resources/js/Layouts/        # Page layouts (AuthenticatedLayout)
├── routes/web.php               # Main routes
├── database/migrations/         # Database schema
├── resources/css/app.css        # Tailwind v4 config + design tokens
├── Dockerfile                   # Multi-stage Docker build (dev)
├── Dockerfile.production        # Production build (Nginx + PHP-FPM)
├── docker-compose.yml           # Local development environment
├── docker-compose.prod.yml      # Production-like testing
├── deploy.sh                    # Interactive deployment script
├── DEPLOYMENT.md                # Complete deployment guide
└── .github/workflows/           # CI/CD (GitHub Actions)
```

## Database Schema

```
users ──1:N──> customers ──1:N──> work_orders

work_orders.status: scheduled | in_progress | completed | cancelled
```

## Deployment

### Oracle Cloud Always Free ($0/month)

**What's Included:**
- 2 AMD VMs (1/8 OCPU, 1GB RAM) — forever free
- PostgreSQL database
- Docker containerization
- GitHub Actions CI/CD

**Quick Deploy:**
```bash
# 1. Create Oracle Cloud account (free forever)
# 2. Provision Ubuntu VM
# 3. SSH into server
# 4. Clone repository
# 5. Configure .env.production
# 6. Deploy:
./deploy.sh
# Select option 3 (Deploy to Production)
```

**Documentation:**
- [DEPLOYMENT.md](DEPLOYMENT.md) — Complete deployment guide
- [GitHub Secrets Setup](.github/SECRETS.md) — CI/CD configuration

### CI/CD Pipeline

**Automatic Testing (on every PR):**
- ✅ PHP tests with PostgreSQL
- ✅ Frontend build
- ✅ Code style checks (Pint)
- ✅ Docker image build

**Automatic Deployment (on merge to main):**
- ✅ SSH into production server
- ✅ Pull latest code
- ✅ Rebuild Docker image
- ✅ Run migrations
- ✅ Restart services
- ✅ Clear cache

**Result:** Push code → Tests pass → Auto-deploy → Live in ~2 minutes

## License

MIT
