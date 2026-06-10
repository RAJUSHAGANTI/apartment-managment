# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (`cd backend`)
```bash
npm install
node src/db/migrate.js   # Run migrations (first-time setup)
node src/db/seed.js      # Seed default users and data
npm run dev              # Start with nodemon on http://localhost:3000
npm start                # Production start
```

### Frontend (`cd frontend`)
```bash
npm install --legacy-peer-deps   # Required flag due to peer dep conflicts
npm start                        # ng serve on http://localhost:4200
npm run build                    # Production build → dist/frontend/browser/
ng test                          # Karma/Jasmine unit tests
```

API docs available at `http://localhost:3000/api/docs` (Swagger UI, requires `swagger/openapi.yaml`).

### Default credentials
| Role   | Username | Password   |
|--------|----------|------------|
| Admin  | admin    | Admin@123  |
| Owner  | owner1   | Owner@123  |
| Tenant | tenant1  | Tenant@123 |

---

## Architecture

### Backend — Layered structure
```
routes → controllers → services → repositories → database (SQLite)
```
- **`backend/src/routes/index.js`** — mounts all route modules under `/api/v1`
- **Controllers** handle HTTP req/res and delegate to services
- **Services** contain business logic; call repositories
- **Repositories** extend `BaseRepository` which provides `findAll`, `findById`, `create`, `update`, `softDelete`, `transaction` — all records use `is_deleted = 0` soft deletes
- **`backend/src/config/database.js`** — single `better-sqlite3` instance (WAL mode, foreign keys ON); imported directly by repositories
- **`backend/src/utils/response.utils.js`** — all responses go through `success()`, `error()`, `unauthorized()`, `forbidden()`, `notFound()`

### Auth & RBAC
- JWT access token (15m) + refresh token (7d). Token payload is set on `req.user` by `authenticate` middleware.
- `requireRoles(...roles)` middleware in `rbac.middleware.js` checks `req.user.role` against allowed roles.
- Three roles: **Admin**, **Owner**, **Tenant** — routes in `app.routes.ts` enforce this via `roleGuard`.
- In development, `POST /api/v1/auth/forgot-password` returns the reset token directly in the response body.

### Frontend — Angular 18 standalone
- All components are standalone; no NgModules.
- **`ApiService`** (`core/services/api.service.ts`) — single HTTP wrapper used by all feature services; base URL from `environment.apiUrl`.
- **`AuthStore`** (`core/auth/auth.store.ts`) — signals-based store (`signal`, `computed`) holding the current user; source of truth for auth state and role checks across the app.
- **`ShellComponent`** (`layout/shell/shell.component.ts`) — wraps all authenticated routes; filters nav items by role from `AuthStore`.
- Feature routes are lazy-loaded via `loadChildren` / `loadComponent`.
- `authGuard` protects all shell routes; `roleGuard` accepts an array of allowed roles per route.
- HTTP interceptors in `core/interceptors/`: `jwt.interceptor.ts` attaches Bearer token, `error.interceptor.ts` handles 401 redirects, `loading.interceptor.ts` drives the loading bar.

### Database
- SQLite file at `backend/database/apartment.db` (path overridable via `DB_PATH` env var).
- Migrations live in `backend/src/db/migrations/` as numbered `.sql` files run in order by `migrate.js`.
- To fully reset: delete `apartment.db`, re-run migrate, then seed.
