# GitHub Actions Secrets Setup

## Required Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add these secrets:

### 1. SERVER_HOST
```
Your Oracle Cloud VM public IP address
Example: 129.146.xxx.xxx
```

### 2. SERVER_USER
```
SSH username for your Oracle Cloud VM
Example: ubuntu
```

### 3. SERVER_SSH_KEY
```
Private SSH key for connecting to your server

To generate:
1. ssh-keygen -t ed25519 -C "github-actions"
2. Copy the private key (cat ~/.ssh/id_ed25519)
3. Paste as secret

To set up on server:
1. Add public key to ~/.ssh/authorized_keys on Oracle Cloud VM
```

### 4. APP_KEY (Optional - for manual setup)
```
base64:your-generated-key-here

Generate with: php artisan key:generate
```

---

## How It Works

### On Every Push/PR to Main:
1. **CI Workflow** runs automatically
2. Installs dependencies (PHP + Node)
3. Builds frontend assets
4. Runs database migrations
5. Executes test suite
6. Checks code style with Pint
7. Builds Docker image (caches for faster deploys)

### On Merge to Main:
1. **CD Workflow** triggers automatically
2. SSHs into Oracle Cloud VM
3. Pulls latest code
4. Rebuilds Docker image
5. Runs migrations
6. Restarts services
7. Clears and rebuilds cache

---

## First-Time Setup on Oracle Cloud VM

```bash
# 1. SSH into your server
ssh -i your-key.pem ubuntu@YOUR_IP

# 2. Clone repository
git clone https://github.com/izzunmustaqim/fieldflow.git
cd fieldflow

# 3. Create .env.production
cp .env.example .env.production
# Edit with your production values

# 4. Build and start
docker compose -f docker-compose.prod.yml up -d

# 5. Add GitHub Actions public key to authorized_keys
echo "your-github-actions-public-key" >> ~/.ssh/authorized_keys
```

---

## Troubleshooting

### Deployment fails with "Permission denied"
- Check that GitHub Actions public key is in `~/.authorized_keys` on server
- Ensure the key has write permissions to the repository directory

### Migration fails
- Check database credentials in `.env.production`
- Ensure PostgreSQL container is running: `docker compose ps`

### Build fails
- Check GitHub Actions logs for specific errors
- Ensure all secrets are configured correctly

---

## Manual Deployment (if needed)

```bash
# SSH into server
ssh -i your-key.pem ubuntu@YOUR_IP

# Navigate to project
cd /var/www/fieldflow-crm

# Pull and rebuild
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker-compose.prod.yml exec app php artisan migrate --force
```
