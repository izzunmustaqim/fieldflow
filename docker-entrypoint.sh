#!/bin/bash
set -e

echo "Starting FieldFlow CRM..."

# Wait for database if using PostgreSQL
if [ "$DB_CONNECTION" = "pgsql" ]; then
    echo "Waiting for PostgreSQL..."
    until php -r "new PDO('pgsql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_DATABASE', $DB_USERNAME, $DB_PASSWORD);" 2>/dev/null; do
        sleep 1
    done
    echo "PostgreSQL is ready!"
fi

# Run migrations if APP_RUN_MIGRATIONS is set
if [ "$APP_RUN_MIGRATIONS" = "true" ]; then
    echo "Running migrations..."
    php artisan migrate --force
fi

# Clear and cache config
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set storage permissions
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

# Start the application
echo "Starting Laravel development server on port 8000..."
exec php artisan serve --host=0.0.0.0 --port=8000
