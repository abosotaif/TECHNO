#!/usr/bin/env bash
set -euo pipefail

# If APP_KEY is missing, generate one (useful for first boot in dev/staging).
if [ -z "${APP_KEY:-}" ] && [ ! -f .env ]; then
  cp .env.example .env
fi
if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
  php artisan key:generate --force --ansi || true
fi

# Storage symlink (idempotent).
php artisan storage:link --force >/dev/null 2>&1 || true

# Wait for DB if MySQL/Postgres is configured.
if [ "${DB_CONNECTION:-sqlite}" != "sqlite" ]; then
  echo "[entrypoint] waiting for database ${DB_HOST}:${DB_PORT}..."
  for i in $(seq 1 60); do
    if php -r "exit(@fsockopen(getenv('DB_HOST'), (int)getenv('DB_PORT')) ? 0 : 1);"; then
      echo "[entrypoint] database is reachable"
      break
    fi
    sleep 1
  done
fi

# Run migrations on every boot. Disable with RUN_MIGRATIONS=false.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force --ansi
fi

# Optional one-shot seed: set RUN_SEEDERS=true on first deploy only.
if [ "${RUN_SEEDERS:-false}" = "true" ]; then
  php artisan db:seed --force --ansi
fi

# Cache config + routes for production-style boots.
if [ "${APP_ENV:-production}" != "local" ]; then
  php artisan config:cache --ansi
  php artisan route:cache  --ansi
  php artisan view:cache   --ansi
fi

exec "$@"
