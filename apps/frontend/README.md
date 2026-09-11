# Frontend

TanStack Start + TanStack Router + React 19 authentication UI.

- `/signup` — create an account (email, name, password)
- `/signin` — sign in
- `/` — protected application page (welcome message + logout)

The session is a JWT in an httpOnly cookie; the app checks it client-side via `GET /api/users/me` after hydration (`src/lib/auth-context.tsx`).

## Scripts

```bash
bun run dev              # vite dev server, port 3000 (proxies /api -> :3001)
bun run build            # production build
bun run lint             # biome lint
bun run check            # biome check
bun run generate-routes  # regenerate the TanStack Router route tree
```

See the root [README](../../README.md) for full setup.
