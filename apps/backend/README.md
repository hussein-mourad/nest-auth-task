# Backend

NestJS 12 (ESM) authentication API — sign up, sign in, sign out, and a protected `GET /users/me`.

- MongoDB via Mongoose (custom connection provider)
- JWT session in an httpOnly cookie
- Swagger docs at `/api/docs`

## Scripts

```bash
bun run dev        # watch mode, port 3001
bun run build      # nest build
bun run lint       # oxlint src/ test/
bun run test       # vitest unit tests
bun run test:e2e   # vitest e2e (uses mongodb-memory-server unless MONGODB_URI is set)
```

See the root [README](../../README.md) for full setup and environment variables.
