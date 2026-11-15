# Kid · Elysia API

Typed Bun API starter with CRUD demo, request validation, `/health`, OpenAPI + Scalar at `/openapi` and an in-memory database. No authentication or durable storage: add these before storing real user data.

```bash
bun install
bun run dev
# open http://localhost:3001/openapi
bun test
bun run check
```

Set `PORT` in `.env` if needed. Routes live in `src/app.ts` for easy testing without starting an HTTP listener. Replace the Map with a real datastore and add access control before production.

## Reproducible installation

Use Bun **1.4.4** and the included `bun.lock`. Run `bun install --frozen-lockfile` to reproduce the checked dependency graph. When deliberately changing dependencies, update the manifest and lockfile together and rerun checks. This folder does not need the monorepo root or its tooling.
