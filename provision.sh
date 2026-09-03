#!/bin/bash
# ============================================================================
# FieldFlow CRM — Oracle Cloud Server Provisioning Script
# ============================================================================
# Run this ONCE on a fresh Oracle Cloud Ubuntu 22.04/24.04 instance.
# It installs Docker, clones the repo, configures SSL, and starts production.
#
# Usage:
#   ssh ubuntu@<server-ip>
#   scp provision.sh ubuntu@<server-ip>:~ && ssh ubuntu@<server-ip> 'sudo bash ~/provision.sh'
# ============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — edit these before running
# ---------------------------------------------------------------------------
APP_NAME="fieldflow"
APP_DOMAIN="${APP_DOMAIN:-}"
APP_EMAIL="${APP_EMAIL:-}"
REPO_URL="${REPO_URL:-}"
BRANCH="${BRANCH:-main}"
APP_DIR="/opt/${APP_NAME}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ---------------------------------------------------------------------------
# Preflight checks
# ---------------------------------------------------------------------------
[[ $EUID -ne 0 ]] && error "Run as root: sudo bash provision.sh"

if [[ -z "$REPO_URL" ]]; then
    read -rp "Git repo URL (HTTPS): " REPO_URL
    [[ -z "$REPO_URL" ]] && error "Repo URL is required"
fi
if [[ -z "$APP_EMAIL" ]]; then
    read -rp "Email for Let's Encrypt: " APP_EMAIL
fi
read -rp "Domain name (leave blank for IP-only): " APP_DOMAIN

# ---------------------------------------------------------------------------
# 1. System updates
# ---------------------------------------------------------------------------
info "Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
    curl wget git unzip \
    ufw fail2ban \
    apt-transport-https ca-certificates gnupg lsb-release

# ---------------------------------------------------------------------------
# 2. Create deploy user (non-root)
# ---------------------------------------------------------------------------
DEPLOY_USER="deploy"
if ! id "$DEPLOY_USER" &>/dev/null; then
    info "Creating deploy user..."
    adduser --disabled-password --gecos "" "$DEPLOY_USER"
    usermod -aG sudo "$DEPLOY_USER"
    usermod -aG docker "$DEPLOY_USER"
    echo "${DEPLOY_USER} ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker compose, /usr/bin/git" \
        > "/etc/sudoers.d/${DEPLOY_USER}"
    chmod 0440 "/etc/sudoers.d/${DEPLOY_USER}"
fi

# ---------------------------------------------------------------------------
# 3. Install Docker
# ---------------------------------------------------------------------------
if ! command -v docker &>/dev/null; then
    info "Installing Docker..."
    curl -fsSL https://get.docker.com | bash
    systemctl enable --now docker
fi
info "Docker version: $(docker --version)"

# ---------------------------------------------------------------------------
# 4. Firewall (UFW)
# ---------------------------------------------------------------------------
info "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

# ---------------------------------------------------------------------------
# 5. Fail2ban
# ---------------------------------------------------------------------------
info "Configuring Fail2ban..."
cat > /etc/fail2ban/jail.local <<'EOF'
[sshd]
enabled = true
port    = ssh
filter  = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime  = 3600
EOF
systemctl enable --now fail2ban

# ---------------------------------------------------------------------------
# 6. SSH hardening
# ---------------------------------------------------------------------------
info "Hardening SSH..."
SSHD_CONFIG="/etc/ssh/sshd_config"
if ! grep -q "# FieldFlow hardening" "$SSHD_CONFIG"; then
    cat >> "$SSHD_CONFIG" <<'EOF'

# FieldFlow hardening
PermitRootLogin prohibit-password
PasswordAuthentication no
X11Forwarding no
MaxAuthTries 3
EOF
    systemctl reload sshd
fi

# ---------------------------------------------------------------------------
# 7. Clone app
# ---------------------------------------------------------------------------
if [[ ! -d "$APP_DIR/.git" ]]; then
    info "Cloning repository..."
    git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
    info "Repository exists, pulling latest..."
    cd "$APP_DIR" && git pull origin "$BRANCH"
fi
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

# ---------------------------------------------------------------------------
# 8. Environment file
# ---------------------------------------------------------------------------
if [[ ! -f "$APP_DIR/.env.production" ]]; then
    warn "No .env.production found!"
    warn "Copy .env.production.example -> .env.production and fill in secrets."
    warn "Then re-run this script to continue."
    cp "$APP_DIR/.env.production.example" "$APP_DIR/.env.production" 2>/dev/null || true
    chmod 600 "$APP_DIR/.env.production" 2>/dev/null || true
    exit 0
fi

# ---------------------------------------------------------------------------
# 9. SSL / Let's Encrypt
# ---------------------------------------------------------------------------
if [[ -n "$APP_DOMAIN" ]]; then
    info "Setting up SSL for ${APP_DOMAIN}..."
    apt-get install -y -qq certbot
    systemctl stop nginx 2>/dev/null || true
    systemctl disable nginx 2>/dev/null || true
    docker compose -f "$APP_DIR/docker-compose.prod.yml" stop nginx 2>/dev/null || true

    certbot certonly --standalone \
        -d "$APP_DOMAIN" \
        --email "$APP_EMAIL" \
        --agree-tos \
        --non-interactive \
        --preferred-challenges http

    mkdir -p "$APP_DIR/ssl"
    cp "/etc/letsencrypt/live/${APP_DOMAIN}/fullchain.pem" "$APP_DIR/ssl/cert.pem"
    cp "/etc/letsencrypt/live/${APP_DOMAIN}/privkey.pem" "$APP_DIR/ssl/key.pem"
    chmod 600 "$APP_DIR/ssl/key.pem"
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/ssl"

    cat > /etc/cron.d/certbot-renew <<EOF
0 3 * * * root certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/*/fullchain.pem /opt/fieldflow/ssl/cert.pem && cp /etc/letsencrypt/live/*/privkey.pem /opt/fieldflow/ssl/key.pem && docker compose -f /opt/fieldflow/docker-compose.prod.yml restart nginx"
EOF
    info "SSL configured for ${APP_DOMAIN}"
else
    warn "No domain specified — skipping SSL. HTTP only."
fi

# ---------------------------------------------------------------------------
# 10. Automated backups
# ---------------------------------------------------------------------------
info "Setting up automated backups..."
BACKUP_DIR="/opt/backups/fieldflow"
mkdir -p "$BACKUP_DIR"
chown "$DEPLOY_USER:$DEPLOY_USER" "$BACKUP_DIR"

cat > /etc/cron.d/fieldflow-backup <<CRON
0 2 * * * $DEPLOY_USER docker compose -f $APP_DIR/docker-compose.prod.yml exec -T postgres pg_dump -U fieldflow fieldflow | gzip > $BACKUP_DIR/db_\$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
0 4 * * * $DEPLOY_USER find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
CRON

# ---------------------------------------------------------------------------
# 11. Log rotation
# ---------------------------------------------------------------------------
cat > /etc/logrotate.d/fieldflow <<EOF
$APP_DIR/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0664 $DEPLOY_USER $DEPLOY_USER
}
EOF

# ---------------------------------------------------------------------------
# 12. Build and start production
# ---------------------------------------------------------------------------
info "Building and starting production containers..."
cd "$APP_DIR"

if ! grep -q "APP_KEY=base64:" .env.production 2>/dev/null; then
    info "Generating application key..."
    docker compose -f docker-compose.prod.yml run --rm app php artisan key:generate --force
fi

docker compose -f docker-compose.prod.yml up -d --build

info "Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T app php artisan migrate --force

info "Caching configuration..."
docker compose -f docker-compose.prod.yml exec -T app php artisan config:cache
docker compose -f docker-compose.prod.yml exec -T app php artisan route:cache
docker compose -f docker-compose.prod.yml exec -T app php artisan view:cache

# ---------------------------------------------------------------------------
# 13. Health check
# ---------------------------------------------------------------------------
info "Running health check..."
sleep 5
if curl -sf http://localhost/health > /dev/null 2>&1; then
    info "Health check passed!"
else
    warn "Health check failed — check: docker compose -f $APP_DIR/docker-compose.prod.yml logs"
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
echo ""
echo "============================================="
echo -e "${GREEN}FieldFlow CRM provisioned successfully!${NC}"
echo "============================================="
echo ""
echo "  App:       http://${APP_DOMAIN:-localhost}"
echo "  SSH:       ssh ${DEPLOY_USER}@<server-ip>"
echo "  App dir:   $APP_DIR"
echo "  Backups:   $BACKUP_DIR (daily at 2 AM)"
echo ""
echo "Next steps:"
echo "  1. Update DNS to point your domain to this server's public IP"
echo "  2. Verify SSL: curl -I https://${APP_DOMAIN:-localhost}"
echo "  3. Create admin user:"
echo "     cd $APP_DIR && docker compose -f docker-compose.prod.yml exec app php artisan tinker"
echo ""
