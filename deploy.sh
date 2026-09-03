#!/bin/bash
set -e

echo "🚀 FieldFlow CRM - Deployment Script"
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not available."
    exit 1
fi

# Menu
echo ""
echo "Select deployment option:"
echo "1) Local Development"
echo "2) Test Production Build"
echo "3) Deploy to Production"
echo "4) Backup Database"
echo "5) Restore Database"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo "🔨 Starting local development environment..."
        docker compose up -d
        echo ""
        echo "✅ Development environment is ready!"
        echo "   App: http://localhost:8000"
        echo "   Vite: http://localhost:5173"
        echo ""
        echo "Run these commands to finish setup:"
        echo "  docker compose exec app composer install"
        echo "  docker compose exec node npm install"
        echo "  docker compose exec app php artisan key:generate"
        echo "  docker compose exec app php artisan migrate"
        ;;
    2)
        echo "🔨 Building production image locally..."
        cp -n .env.example .env.production 2>/dev/null || true
        docker compose -f docker-compose.prod.yml up -d --build
        echo ""
        echo "✅ Production build is ready!"
        echo "   Test at: http://localhost"
        ;;
    3)
        echo "🚀 Deploying to production..."
        if [ ! -f .env.production ]; then
            echo "❌ .env.production not found!"
            echo "   Copy .env.example to .env.production and configure it first."
            exit 1
        fi
        docker compose -f docker-compose.prod.yml up -d --build
        docker compose -f docker-compose.prod.yml exec app php artisan migrate --force
        echo ""
        echo "✅ Deployed successfully!"
        ;;
    4)
        echo "💾 Backing up database..."
        docker compose exec postgres pg_dump -U fieldflow fieldflow > "backup_$(date +%Y%m%d_%H%M%S).sql"
        echo "✅ Backup completed!"
        ;;
    5)
        echo "📥 Restoring database..."
        read -p "Enter backup filename: " backup_file
        if [ -f "$backup_file" ]; then
            docker compose exec -T postgres psql -U fieldflow fieldflow < "$backup_file"
            echo "✅ Restore completed!"
        else
            echo "❌ Backup file not found!"
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
