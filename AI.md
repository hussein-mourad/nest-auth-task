# AI.md

How I used AI assistance while building this project, what worked, and what I had to correct.

## Approach

I used AI (OpenCode with a `deepseek-v4-pro` model and Context7 for library docs) as a force multiplier: to plan, scaffold, and generate boilerplate quickly, then reviewed and owned every change. The whole task was planned up front against the spec (`docs/PLAN.md`), which kept the implementation focused.

## What AI generated

- **Backend scaffolding** — NestJS module structure (`config`, `database`, `users`, `auth`), the DTOs with `class-validator` rules, the cookie-based `JwtAuthGuard`, and the global exception filter.
- **Validation logic** — the password rule regexes (min 8, letter, number, special char) and their mirror in the frontend.
- **Frontend UI** — the sign-up/sign-in forms and the protected home page, Tailwind styling, and the `AuthProvider`/`useAuth` context.
- **Tests** — unit tests for `AuthService` and `SignUpDto`, plus the e2e auth flow with `supertest`.
- **Docs/CI** — this file, the README, and the GitHub Actions workflow.

## What worked well

- Planning first (writing `docs/PLAN.md`) before writing code.
- Checking package versions and peer dependencies with `npm view` before installing (e.g. confirming `@nestjs/config`/`@nestjs/jwt`/`@nestjs/swagger` have Nest 12-compatible releases).
- Using the repo's own `AGENTS.md` conventions (ESM `.js` import extensions, oxlint/vitest, no comments) as the source of truth.
- The `setupApp()` helper shared between `main.ts` and the e2e test — one place for global pipes, CORS, and Swagger.

## What needed correcting

- **ESM type imports** — `isolatedModules` + `emitDecoratorMetadata` forced `import type` for types used in decorated signatures (e.g. `Response`, `AuthUser`). The first build surfaced this (`TS1272`).
- **A circular import** — `UsersService` imported `USER_MODEL` from `users.module.ts`, which imports the service. Moved the token to its own `user.constants.ts`.
- **JWT expiry mismatch** — I initially wrote `JWT_EXPIRES=24h` in `.env.example` while the code did `Number(JWT_EXPIRES)`, producing `NaN` and a 500 on signup. Standardized on seconds (`86400`) and added a `^\d+$` env validation rule.
- **E2e config capture** — `ConfigModule.forRoot` reads env at module import time, so setting `MONGODB_URI` in `beforeAll` was silently ignored (tests were hitting the local Docker Mongo instead of the in-memory one). Fixed by lazily `await import()`-ing `AppModule` after setting env. This was the most important correction — it made the e2e tests actually isolated.
- **mongodb-memory-server** — first run downloads a ~75MB binary and blew the 10s hook timeout; raised `hookTimeout`.
- **MongoDB 8.0 vs kernel** — the compose image `mongodb-community-server:8.0` refuses to start on Linux kernel 6.19+ (tcmalloc). Downgraded to `mongo:7.0`.

## Decisions made differently than AI suggested

- **Mongoose without `@nestjs/mongoose`** — used a hand-rolled `DATABASE_CONNECTION` provider with `mongoose.createConnection()` to avoid a peer-dependency layer and keep the DI explicit.
- **`@nestjs/jwt` + custom guard instead of Passport** — fewer dependencies for a single JWT strategy, and the guard reads the httpOnly cookie directly.
- **Removed `@nestjs/observe`** — the scaffold shipped placeholder API keys for a commercial SaaS; I dropped it in favor of the built-in Nest logger + a global exception filter.
- **`bcryptjs` over native `bcrypt`** — avoids native-build friction under Bun/CI with no functional difference for this use case.
- **Biome formatting** — aligned the whole frontend to `biome.json` (double quotes, tabs) rather than keeping the scaffold's Prettier-style single quotes, so `biome check` passes cleanly.
