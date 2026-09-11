# Plan: NestJS + MongoDB Auth Module with TanStack Start Frontend

## Task summary

Implement a production-ready sign up / sign in module:

- **Frontend** (React or Vue, TypeScript): sign up page, sign in page, application page ("Welcome to the application.", optional logout).
- **Backend** (NestJS + MongoDB): sign up / sign in endpoints, at least one protected endpoint, README.
- Bonus: logging, error handling, testing, CI/CD, API documentation.
- Include an `AI.md` describing AI usage (not optional).

## Current state (verified)

- **Root**: `turbo` + `bun` monorepo. `package.json` only has `turbo`; no workspaces config, no `turbo.json`.
- **`apps/backend`**: Nest 12 scaffold, ESM (`"type": "module"`), vitest (unit + e2e), oxlint, TypeScript 6. Still the vanilla "hello world" (`AppController`/`AppService`), no auth, no DB. Contains a nested `.git` (from scaffolding) that must be removed.
- **`apps/frontend`**: TanStack Start (latest) + TanStack Router (file-based routing), React 19, Tailwind v4, Biome. Dev server on port **3000**.

## Decisions

- Frontend: **TanStack Start** (already scaffolded) + Tailwind CSS.
- Session: JWT in an **httpOnly cookie** (production-ready). Dev uses a Vite proxy for same-origin `/api`; prod uses CORS with credentials + `FRONTEND_ORIGIN`.
- Backend: **Mongoose used directly** (custom `DatabaseModule` provider) instead of `@nestjs/mongoose` to avoid Nest 12 peer-dependency mismatch. `@nestjs/jwt` + custom `JwtAuthGuard` (no passport). `bcrypt` for hashing. `class-validator`/`class-transformer` for DTO validation. `@nestjs/swagger` for docs.

## 1. Repo setup

- Root `package.json`: add `workspaces: ["apps/*"]` and turbo scripts (`dev`, `build`, `test`, `lint`).
- Add `turbo.json` with the task pipeline.
- Remove `apps/backend/.git`; `git init` at root (commit only when explicitly asked).
- Root `.gitignore`, `.env.example` (`MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES`, `PORT`, `FRONTEND_ORIGIN`), `docker-compose.yml` for local MongoDB.
- Root `README.md` and `AI.md`.

## 2. Backend (`apps/backend`) — Nest 12

- Run on port **3001** with global prefix `api` (frontend dev uses 3000; Vite proxies `/api/*` -> `:3001`).
- Dependencies: `@nestjs/config`, `@nestjs/jwt`, `@nestjs/swagger`, `mongoose`, `bcrypt`, `class-validator`, `class-transformer`, `cookie-parser`, `helmet`.
- Modules:
  - `config` — global validated env config via `@nestjs/config`.
  - `database` — custom Mongoose connection provider (`useFactory`, `MONGODB_URI`).
  - `users` — `User` schema (email unique index, name, passwordHash), `UsersService`, `GET /users/me` (protected).
  - `auth` — `AuthController` (`POST /auth/signup`, `POST /auth/signin`, `POST /auth/signout`), `AuthService` (bcrypt hash/compare, JWT sign, set/clear httpOnly cookie), `JwtAuthGuard` reading the cookie.
- Validation: global `ValidationPipe` (whitelist + transform).
  - `SignUpDto`: email `isEmail`, name `minLength(3)`, password regex (min 8, >=1 letter, >=1 number, >=1 special char).
  - `SignInDto`: email + password.
- Security: bcrypt (10 rounds), httpOnly + sameSite cookie, CORS with credentials + `FRONTEND_ORIGIN`, duplicate email -> 409 (Mongo 11000), global exception filter with a consistent error shape that does not leak internals, `helmet`, Nest Logger.
- Docs: Swagger at `/api/docs`.
- Tests: vitest unit (`AuthService`, `UsersService`) + e2e (signup -> signin -> `/users/me`) using `mongodb-memory-server` + `supertest`; adapt existing `test/app.e2e-spec.ts` and `vitest.config.e2e.ts`.
- Verify Nest 12 compatibility of `@nestjs/jwt`/`@nestjs/swagger` during install; fall back to `jose` for JWT signing if needed.

## 3. Frontend (`apps/frontend`) — TanStack Start

- Add `server.proxy` in `vite.config.ts` for `/api`.
- File-based routes: `/signup`, `/signin`, `/` (protected app page).
- `AuthProvider` (React context) that checks `/users/me` on the client after hydration (avoids SSR cookie-forwarding complexity). Router renders a loading state until the session is known, then redirects:
  - authenticated users away from `/signup` and `/signin`,
  - guests away from `/`.
- Signup page: email / name / password / confirm-password, client validation mirroring backend rules, inline server errors.
- Signin page: email / password.
- App page: "Welcome to the application." + logout button (calls `POST /auth/signout`, clears session state).
- Tailwind v4 styling, accessible form states; remove devtools clutter from `__root.tsx` for production.

## 4. Docs & extras (bonus points)

- Root `README.md`: setup, env vars, scripts, API overview.
- `AI.md`: honest account of AI usage — prompts that worked, what needed fixing, decisions made differently.
- GitHub Actions CI: lint + test + build for both apps.

## Verification

- `bun run build/test/lint` in both apps (via turbo).
- e2e suite green.
- Manual smoke test of signup -> signin -> protected route via dev servers.

## Submission

- Init git + commit only when asked; creating the public GitHub repo and pushing is the user's (or use `gh` if authenticated).

## Open decisions

1. Backend on port 3001 with `/api` prefix — default yes.
2. `AI.md` — full narrative drafted as work proceeds vs. summary for user to finalize.
3. Session expiry 24h, cookie-only signout (no server-side blacklist) — default yes.
