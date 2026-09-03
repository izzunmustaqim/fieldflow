#!/bin/bash
# ============================================================================
# FieldFlow CRM — Deploy Update (pull + rebuild + migrate)
# ============================================================================
# Run on the production server to pull latest code and redeploy.
# Usage: bash scripts/deploy-update.sh [--skip-backup]
# ============================================================================
set -euo pipefail

APP_DIR="/opt/fieldflow"
COMPOSE_FILE="docker-compose.prod.yml"
SKIP_BACKUP="${1:-}"
BRANCH="${BRANCH:-main}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

cd "$APP_DIR" || error "App directory not found: $APP_DIR"

# ------------------------------------------
# 1. Pre-deploy backup
# ------------------------------------------
if [[ "$SKIP_BACKUP" != "--skip-backup" ]]; then
    info "Creating pre-deploy database backup..."
    BACKUP_DIR="/opt/backups/fieldflow"
    mkdir -p "$BACKUP_DIR"
    docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U fieldflow fieldflow \
        | gzip > "$BACKUP_DIR/pre_deploy_$(date +%Y%m%d_%H%M%S).sql.gz" 2>/dev/null \
        || warn "Backup failed (DB may not be running yet)"
fi

# ------------------------------------------
# 2. Pull latest code
# ------------------------------------------
info "Pulling latest code from origin/$BRANCH..."
git fetch origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [[ "$LOCAL" == "$REMOTE" ]]; then
    info "Already up to date ($LOCAL)"
    echo ""
    read -rp "Force rebuild anyway? [y/N]: " force
    [[ "$force" != "y" && "$force" != "Y" ]] && exit 0
fi

git pull origin "$BRANCH"
NEW=$(git rev-parse HEAD)
info "Updated: $LOCAL -> $NEW"

# ------------------------------------------
# 3. Build and restart
# ------------------------------------------
info "Building production containers..."
docker compose -f "$COMPOSE_FILE" up -d --build

# ------------------------------------------
# 4. Run migrations
# ------------------------------------------
info "Running migrations..."
docker compose -f "$COMPOSE_FILE" exec -T app php artisan migrate --force

# ------------------------------------------
# 5. Clear and rebuild caches
# ------------------------------------------
info "Rebuilding caches..."
docker compose -f "$COMPOSE_FILE" exec -T app php artisan config:cache
docker compose -f "$COMPOSE_FILE" exec -T app php artisan route:cache
docker compose -f "$COMPOSE_FILE" exec -T app php artisan view:cache
docker compose -f "$COMPOSE_FILE" exec -T app php artisan filament:cache-components 2>/dev/null || true

# ------------------------------------------
# 6. Restart queue workers
# ------------------------------------------
info "Restarting queue workers..."
docker compose -f "$COMPOSE_FILE" restart queue 2>/dev/null || true

# ------------------------------------------
# 7. Health check
# ------------------------------------------
info "Running health check..."
sleep 3
if docker compose -f "$COMPOSE_FILE" exec -T app php artisan about > /dev/null 2>&1; then
    info "Application is responding"
else
    warn "Health check inconclusive — verify manually"
fi

echo ""
echo "========================================="
echo -e "${GREEN}Deployment complete!${NC}"
echo "  Commit: $NEW"
echo "  Time:   $(date)"
echo "========================================="
