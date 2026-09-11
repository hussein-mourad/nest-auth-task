# Nest Auth

A production-ready authentication module: sign up, sign in, and a protected application page.

- **Backend** — NestJS 12 (ESM) + MongoDB (Mongoose) + JWT session in an httpOnly cookie
- **Frontend** — TanStack Start + TanStack Router + React 19 + Tailwind CSS v4

## Prerequisites

- [Bun](https://bun.sh) (>= 1.3)
- [Docker](https://www.docker.com/) (for the local MongoDB) — or any MongoDB 7.x instance

## Getting started

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.example .env
#   - set JWT_SECRET to a long random string, e.g. `openssl rand -base64 48`

# 3. Start MongoDB (skippable if you already have one running)
docker compose up -d

# 4. Run both apps in dev mode
bun run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Swagger docs: http://localhost:3001/api/docs

## Scripts

Run from the repo root:

| Command         | Description                         |
| --------------- | ----------------------------------- |
| `bun run dev`   | Start backend + frontend dev servers |
| `bun run build` | Build all apps                       |
| `bun run test`  | Run all tests                        |
| `bun run lint`  | Lint all apps                        |

Per-app scripts live under `apps/backend` and `apps/frontend` (see their `package.json`).

## Environment variables

| Variable          | Description                                  | Default                              |
| ----------------- | -------------------------------------------- | ------------------------------------ |
| `MONGODB_URI`     | MongoDB connection string                    | `mongodb://localhost:27017/nest-auth` |
| `JWT_SECRET`      | Secret used to sign JWTs (required)          | —                                    |
| `JWT_EXPIRES`     | Session lifetime in seconds                  | `86400` (24h)                        |
| `PORT`            | Backend HTTP port                            | `3001`                               |
| `FRONTEND_ORIGIN` | Origin allowed by CORS (credentials enabled) | `http://localhost:3000`              |

## API

All routes are prefixed with `/api`.

| Method | Endpoint         | Auth  | Description                          |
| ------ | ---------------- | ----- | ------------------------------------ |
| POST   | `/auth/signup`   | —     | Create an account, set session cookie |
| POST   | `/auth/signin`   | —     | Sign in, set session cookie           |
| POST   | `/auth/signout`  | Cookie | Clear the session cookie             |
| GET    | `/users/me`      | Cookie | Protected endpoint: current user     |

The session is a JWT stored in an httpOnly, SameSite=Lax cookie. Protected endpoints verify it via a custom `JwtAuthGuard`.

## Validation

Sign-up fields are validated on both client and server:

- **Email** — valid email format
- **Name** — at least 3 characters
- **Password** — at least 8 characters, with at least one letter, one number, and one special character

## Testing

```bash
bun run test          # backend unit tests (vitest)
bun run test:e2e      # backend e2e tests (vitest + supertest)
```

E2e tests spin up an in-memory MongoDB (`mongodb-memory-server`) automatically. To run them against a real MongoDB instead, set `MONGODB_URI` before running.

## Project structure

```
apps/
  backend/   NestJS 12 API (config, database, users, auth modules)
  frontend/  TanStack Start SPA (signup, signin, home routes)
docs/
  PLAN.md                Implementation plan
  Full_Stack_Test_Task.md Original task spec
compose.yml              Local MongoDB (and Mongo Express UI)
```
