# AGENTS.md

Guidance for AI agents (and contributors) working in this repository.

## Overview

Monorepo for a full-stack authentication module. Managed with **bun** workspaces + **turborepo**.

```
apps/
  backend/   NestJS 12 (ESM) + MongoDB + Mongoose + JWT auth
  frontend/  TanStack Start + TanStack Router + React 19 + Tailwind v4
docs/
  PLAN.md            Implementation plan
  Full_Stack_Test_Task.md   Original task spec
```

## Commands

Run from the repo root:

```bash
bun install                 # install all workspace deps
bun run dev                 # turbo: run backend + frontend dev servers
bun run build               # turbo: build all apps
bun run test                # turbo: run all tests
bun run lint                # turbo: lint all apps
```

Per-app (in `apps/<app>`):

```bash
# backend
bun run start:dev           # watch mode, port 3001
bun run build               # nest build
bun run lint                # oxlint src/ test/
bun run test                # vitest run (unit)
bun run test:e2e            # vitest e2e (requires MONGODB_URI or mongodb-memory-server)

# frontend
bun run dev                 # vite dev, port 3000 (proxies /api -> :3001)
bun run build               # vite build
bun run lint                # biome lint
bun run check               # biome check
```

## Tooling conventions

- **Package manager**: bun (uses `bun.lock`). Do not introduce npm/pnpm/yarn lockfiles.
- **Backend**: TypeScript 6, ESM (`"type": "module"`, `moduleResolution: nodenext`). Lint with oxlint, format with prettier, test with vitest (not jest).
- **Frontend**: TypeScript 6, ESM. Lint/format with Biome (`biome.json`). Routing is file-based (TanStack Router); regenerate with `bun run generate-routes` after adding/removing route files.
- **Ports**: backend `3001` (global `/api` prefix), frontend dev `3000` (proxies `/api` -> backend).
- **No comments** in code unless genuinely clarifying; keep code clean and self-documenting.

## Architecture notes

- Backend modules: `config` (validated env), `database` (Mongoose connection provider — no `@nestjs/mongoose`), `users` (User schema + `GET /users/me` protected route), `auth` (signup/signin/signout, JWT in httpOnly cookie, custom `JwtAuthGuard`).
- Global `ValidationPipe` (whitelist + transform) validates DTOs.
- Auth flow: signup/signin sets an httpOnly cookie; protected endpoints verify it via `JwtAuthGuard`.
- Frontend checks session via `/users/me` on the client after hydration (`AuthProvider`), not during SSR.

## Environment variables

Copy `.env.example` to `.env` (root) before running. Required: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES`, `PORT`, `FRONTEND_ORIGIN`.

## Testing

- Backend e2e uses `mongodb-memory-server` when no external DB is available; a real Mongo can be provided via `MONGODB_URI` or `docker compose up`.
- Keep tests deterministic and free of network dependencies where possible.
