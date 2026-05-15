# Vision Techno — Web Platform

A two-tier web application:

- **`backend/`** — Laravel 11 REST API (Sanctum auth, Products resource, unified API exception envelope, MySQL/Postgres/SQLite-ready).
- **`frontend/`** — React 18 + Vite + TypeScript SPA (Redux Toolkit + RTK Query, React Router with lazy-loaded routes, i18n EN/AR with RTL toggle, fully responsive layout).

> **Note on "React Native":** React Native targets iOS and Android. For a *fully responsive website* the correct tool is **React** (used here). If a single codebase that runs on web + iOS + Android is required, that needs **React Native + React Native Web** (typically via Expo) — open an issue and we can add a third package for it.

---

## Repository layout

```
.
├── backend/         Laravel 11 API
│   ├── app/         Models, Controllers, Requests, Resources, Exceptions
│   ├── bootstrap/   Application bootstrap (statefulApi + API exception renderer)
│   ├── config/      app, auth, cors, database, logging, sanctum, session
│   ├── database/    Migrations, factories, seeders
│   ├── public/      Front controller (index.php)
│   └── routes/      api.php, web.php, console.php
└── frontend/        React + Vite + TypeScript SPA
    └── src/
        ├── app/         Redux store
        ├── features/    auth slice + products RTK Query API
        ├── pages/       Lazy-loaded routes
        ├── components/  Shared UI (Layout, Header, Footer, ...)
        ├── i18n/        i18next setup with EN + AR resources
        └── styles/      Global CSS (responsive + RTL aware)
```

---

## Backend — quick start

```bash
cd backend
cp .env.example .env

composer install
php artisan key:generate

# SQLite is the default. Create the file once:
mkdir -p database && touch database/database.sqlite

php artisan migrate --seed
php artisan serve            # http://127.0.0.1:8000
```

Default seeded admin (for development only):

```
email:    admin@vision-techno.test
password: password
```

### REST endpoints

| Method | Path                          | Auth        | Purpose                    |
| ------ | ----------------------------- | ----------- | -------------------------- |
| GET    | `/api/health`                 | -           | Health check               |
| POST   | `/api/auth/register`          | -           | Register a user            |
| POST   | `/api/auth/login`             | -           | Login (returns Sanctum token) |
| GET    | `/api/auth/me`                | Sanctum     | Current user               |
| POST   | `/api/auth/logout`            | Sanctum     | Revoke current token       |
| GET    | `/api/products`               | -           | Paginated product list (filters: `q`, `category`, `brand`, `per_page`) |
| GET    | `/api/products/{slug}`        | -           | Single product             |
| POST   | `/api/products`               | Sanctum     | Create                     |
| PUT/PATCH | `/api/products/{id}`       | Sanctum     | Update                     |
| DELETE | `/api/products/{id}`          | Sanctum     | Delete                     |

All errors are returned in a single envelope:

```json
{ "error": { "code": "validation_error", "message": "...", "details": { "email": ["..."] } } }
```

---

## Frontend — quick start

```bash
cd frontend
cp .env.example .env

npm install
npm run dev                   # http://127.0.0.1:5173
```

The frontend reads `VITE_API_URL` (default `http://127.0.0.1:8000/api`) and stores the Sanctum token in `localStorage` under `vt_token`.

---

## Production notes

- See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full Docker / CI / hosting guide. TL;DR: `docker compose up --build` runs the entire stack (MySQL + backend + frontend) end-to-end.
- Run `php artisan config:cache route:cache view:cache` after deploy.
- Build the SPA with `npm run build` and serve `frontend/dist` from a CDN or behind Nginx; reverse-proxy `/api/*` to the Laravel app.
- Keep `APP_DEBUG=false` in production. The exception renderer hides traces unless debug mode is on.
- Add a real role/policy layer before exposing the write endpoints publicly.
