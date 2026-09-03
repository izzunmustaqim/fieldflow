# FieldFlow CRM Deployment Guide

## Prerequisites

- Docker Desktop installed
- Oracle Cloud account (Always Free tier)
- Domain name (optional, can use IP)

---

## Local Development with Docker

### Start Development Environment

```bash
# Build and start containers
docker-compose up -d

# Install dependencies (first time only)
docker-compose exec app composer install
docker-compose exec node npm install

# Generate app key
docker-compose exec app php artisan key:generate

# Run migrations
docker-compose exec app php artisan migrate

# Seed database (optional)
docker-compose exec app php artisan db:seed

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

Access:
- App: http://localhost:8000
- Vite Dev Server: http://localhost:5173

---

### Test Production Build Locally

```bash
# Copy and configure environment
cp .env.example .env.production
# Edit .env.production with your settings

# Build and run production containers
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Test at http://localhost
```

---

## Deploy to Oracle Cloud (Always Free)

### Step 1: Create Oracle Cloud Account

1. Go to https://cloud.oracle.com/free
2. Sign up for Always Free account
3. You'll get:
   - 2 AMD VMs (1/8 OCPU, 1GB RAM each) - **forever free**
   - 2 ARM VMs (up to 4 OCPU, 24GB RAM) - **forever free**
   - Free Autonomous Database
   - Free Object Storage

### Step 2: Create Compute Instance

1. Go to Compute → Instances → Create Instance
2. Choose **Ubuntu 22.04** or **Oracle Linux 8**
3. Select **VM.Standard.E2.1.Micro** (Always Free eligible)
4. Upload SSH key
5. Note the public IP address

### Step 3: Connect to Your Server

```bash
ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP
```

### Step 4: Install Docker on Oracle Cloud

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, then verify
docker --version
```

### Step 5: Clone Your Repository

```bash
# Install git
sudo apt install git -y

# Clone repository
git clone https://github.com/YOUR_USERNAME/fieldflow-crm.git
cd fieldflow-crm
```

### Step 6: Configure Environment

```bash
# Create production environment file
cp .env.example .env.production

# Generate app key
php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"

# Edit .env.production
nano .env.production
```

Set these values in `.env.production`:

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_GENERATED_KEY
APP_URL=http://YOUR_PUBLIC_IP

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=fieldflow
DB_USERNAME=fieldflow
DB_PASSWORD=YOUR_SECURE_PASSWORD

CACHE_STORE=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database
```

### Step 7: Deploy with Docker

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Step 8: Configure Firewall (Oracle Cloud)

1. Go to your instance → Virtual Cloud Network
2. Go to Security Lists
3. Add Ingress Rules:
   - Source CIDR: 0.0.0.0/0
   - Destination Port: 80 (HTTP)
   - Destination Port: 443 (HTTPS)

---

## Add Free SSL with Let's Encrypt

### Option 1: With a Domain Name

```bash
# Install Certbot
sudo apt install certbot -y

# Stop containers temporarily
docker compose -f docker-compose.prod.yml down

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update docker-compose.prod.yml to mount certificates
# Add to app service volumes:
# - /etc/letsencrypt:/etc/letsencrypt:ro

# Restart with SSL
docker compose -f docker-compose.prod.yml up -d
```

### Option 2: Without Domain (IP Address)

Let's Encrypt doesn't work with bare IPs. Options:
1. Use Cloudflare (free) with a domain
2. Use self-signed certificate (browsers will warn)
3. Just use HTTP (okay for development/testing)

---

## Maintenance Commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f app
docker compose logs -f postgres

# Enter container shell
docker compose exec app sh

# Run artisan commands
docker compose exec app php artisan migrate
docker compose exec app php artisan cache:clear

# Backup database
docker compose exec postgres pg_dump -U fieldflow fieldflow > backup.sql

# Restore database
docker compose exec -T postgres psql -U fieldflow fieldflow < backup.sql

# Update application
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Stop everything
docker compose -f docker-compose.prod.yml down

# Remove volumes (CAUTION: deletes data)
docker compose -f docker-compose.prod.yml down -v
```

---

## Resource Usage

**Oracle Cloud Always Free Limits:**
- 2 AMD instances: 1/8 OCPU, 1GB RAM each
- 2 ARM instances: 4 OCPU, 24GB RAM total
- 200GB block storage
- 10GB object storage

**FieldFlow CRM Requirements:**
- Minimum: 512MB RAM, 0.5 OCPU
- Recommended: 1GB RAM, 1 OCPU

**Docker on Free Tier:**
- Works perfectly for small teams
- PostgreSQL uses ~100MB RAM
- Laravel uses ~50-100MB RAM
- Plenty of headroom for traffic

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs app

# Common issues:
# - Missing APP_KEY: Generate with php artisan key:generate
# - Database connection: Check PostgreSQL is running
# - Permission errors: Check storage/ permissions
```

### Database connection refused

```bash
# Ensure PostgreSQL is healthy
docker compose ps

# Check PostgreSQL logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U fieldflow -d fieldflow
```

### Out of memory

```bash
# Check memory usage
docker stats

# If running out, consider:
# - Using swap file
# - Upgrading to paid tier
# - Optimizing PostgreSQL config
```

---

## Next Steps

1. ✅ Set up automated backups
2. ✅ Configure monitoring (UptimeRobot - free)
3. ✅ Add domain name + SSL
4. ✅ Set up CI/CD (GitHub Actions - free)
5. ✅ Configure email (Mailgun - free tier)

---

## Cost Summary

| Service | Cost |
|---------|------|
| Oracle Cloud VM | $0/month |
| PostgreSQL | $0/month |
| Docker | $0/month |
| SSL (Let's Encrypt) | $0/month |
| **Total** | **$0/month** |

**You now have a production-ready CRM running for $0/month forever!** 🎉
