# Deployment

This repository ships with two production-ready Docker images and a `docker-compose.yml` for the full local stack.

## Local end-to-end (one command)

```bash
cp backend/.env.example backend/.env

# First-time only: set RUN_SEEDERS=true to seed admin + demo products.
RUN_SEEDERS=true docker compose up --build
```

| Service   | URL                                  | Notes                                 |
| --------- | ------------------------------------ | ------------------------------------- |
| Frontend  | http://localhost:5173                | Static SPA served by Nginx            |
| Backend   | http://localhost:8080                | Laravel API (PHP-FPM + Nginx)         |
| Health    | http://localhost:8080/up             | Returns 200 when boot completed       |
| Database  | mysql://localhost:3306               | MySQL 8, persisted in `db-data` volume |

Seeded admin (development only):

```
email:    admin@vision-techno.test
password: password
```

## Backend image

Multi-stage `backend/Dockerfile`:

1. `composer:2.7` installs production dependencies with cached layers.
2. `php:8.3-fpm-bookworm` runs PHP-FPM and Nginx under `supervisord`. OPcache is enabled with `validate_timestamps=0`. Logs go to `stdout` / `stderr` as JSON for easy ingestion.

The `entrypoint.sh` waits for the database, generates `APP_KEY` if missing, runs `migrate --force`, and (when `APP_ENV != local`) caches config / routes / views before starting `supervisord`.

Build standalone:

```bash
docker build -t vision-techno-backend ./backend
docker run --rm -p 8080:8080 \
    -e APP_KEY=base64:$(openssl rand -base64 32) \
    -e DB_CONNECTION=sqlite \
    vision-techno-backend
```

## Frontend image

Multi-stage `frontend/Dockerfile`:

1. `node:22-alpine` runs `npm ci && npm run build` with `VITE_API_URL` baked into the bundle.
2. `nginx:1.27-alpine` serves `dist/` with SPA fallback (`/index.html`) and long-cache headers for hashed `assets/*`.

Build standalone:

```bash
docker build \
    --build-arg VITE_API_URL=https://api.example.com/api \
    -t vision-techno-frontend ./frontend

docker run --rm -p 5173:80 vision-techno-frontend
```

In production, either:

- Serve the SPA from a CDN (Cloudflare Pages, Netlify, Vercel, S3+CloudFront) — set `VITE_API_URL` to your API origin at build time, or
- Run the bundled Nginx and uncomment the `/api/` reverse-proxy block in `frontend/docker/nginx.conf` to point at the backend service.

## CI / CD

Two GitHub Actions workflows are wired up:

- **`.github/workflows/ci.yml`** runs on every push/PR:
  - **backend**: PHP 8.3, Composer cache, SQLite migrations, `phpunit` (skipped if `tests/` is empty), `pint --test` lint (advisory).
  - **frontend**: Node 22, `npm ci`, `npm run build` (which is `tsc -b && vite build` so type errors fail the build), `npm run lint` (advisory).
- **`.github/workflows/docker.yml`** runs on `main` and version tags (`v*.*.*`):
  - Builds and pushes both images to GHCR (`ghcr.io/<owner>/<repo>/{backend,frontend}`) using Buildx and `gha` cache.
  - Tags include branch name, PR number, semver, and short SHA.

Required permissions are already declared in the workflow (`packages: write`) — no additional secrets are needed for GHCR pushes from a public repo.

## Production checklist

- [ ] Set `APP_KEY` to a stable, secret value (do **not** rely on the entrypoint generator beyond the first boot).
- [ ] `APP_DEBUG=false` and `APP_ENV=production`.
- [ ] Configure `DB_*` to point at a managed Postgres or MySQL.
- [ ] Set `SANCTUM_STATEFUL_DOMAINS` and `FRONTEND_URL` to your real frontend domain (used by `config/cors.php`).
- [ ] Run `php artisan migrate --force` only — keep `RUN_SEEDERS=false` in production.
- [ ] Put HTTPS in front of both services (the nginx configs assume TLS termination upstream).
- [ ] Replace the in-checkout payment stub with a real gateway (Stripe / Paymob webhook flips `pending` → `paid`).
- [ ] Add a role/permission package (e.g. `spatie/laravel-permission`) if you need finer-grained admin rights than the current `users.is_admin` boolean.
- [ ] Wire log shipping (Nginx access logs are already JSON; PHP logs go to stderr).
- [ ] Configure scheduled tasks if/when needed (`docker run ... php artisan schedule:work` as a sidecar).

## Hosting suggestions

| Component  | Suggested platform                                  |
| ---------- | --------------------------------------------------- |
| Backend    | Render, Railway, Fly.io, AWS App Runner, ECS, Forge |
| Frontend   | Cloudflare Pages, Netlify, Vercel, S3+CloudFront    |
| Database   | PlanetScale (MySQL), Neon (Postgres), AWS RDS       |
| Object storage (later) | Cloudflare R2, AWS S3                  |



## Deploying the SPA to Vercel

The frontend is a Vite + React SPA — a perfect fit for Vercel. The Laravel backend is **not** deployed to Vercel; it goes on Render, Railway, Fly.io, or a VPS (Vercel's serverless model breaks queues, WebSockets, and persistent storage).

### One-time setup

1. https://vercel.com → "Add New Project" → import this repo.
2. **Root Directory: `frontend`** (this repo is a monorepo).
3. Framework Preset auto-detects **Vite** and uses `frontend/vercel.json`:
   - Build: `npm run build`
   - Output: `dist`
   - SPA fallback rewrite: `/((?!.*\\.).*)` → `/index.html` so `/products/abc` doesn't 404 on refresh.
   - `assets/*` cached for a year, `index.html` never cached.
4. Set the environment variables (Production + Preview):

   | Variable                | Value                                       |
   | ----------------------- | ------------------------------------------- |
   | `VITE_API_URL`          | `https://api.your-domain.com/api`           |
   | `VITE_REVERB_APP_KEY`   | the same key as backend `REVERB_APP_KEY` (omit to disable real-time) |
   | `VITE_REVERB_HOST`      | host where `php artisan reverb:start` is exposed |
   | `VITE_REVERB_PORT`      | usually `443` behind a TLS proxy            |
   | `VITE_REVERB_SCHEME`    | `https` in production                       |

5. Click **Deploy**. Vercel will give you `https://your-app.vercel.app`.
6. Custom domain: Project → Settings → Domains → add `vision-techno.com`. Copy the DNS records Vercel shows you and apply them at your registrar.

### After the backend is up

Update `VITE_API_URL` and `SANCTUM_STATEFUL_DOMAINS` (on the backend) so they reference each other's real domains, then trigger a redeploy on both sides.

### What happens on every push

- Push to `main` → Vercel builds and promotes to Production.
- Push to a feature branch / open a PR → Vercel builds a Preview deployment and posts the URL on the PR. Each preview gets its own URL, which is perfect for review.

### What Vercel will *not* do for this project

- Run the Laravel API.
- Run Reverb / WebSockets.
- Serve `/sitemap.xml` (that's a backend route — point your DNS / proxy at the backend host for `/sitemap.xml` and `/robots.txt`-overrides if you want them under the apex domain).
