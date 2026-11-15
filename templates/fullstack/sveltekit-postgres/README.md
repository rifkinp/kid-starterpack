# Kid · SvelteKit + PostgreSQL + Better Auth

Vendor-neutral fullstack starter: SvelteKit 2, Svelte 5, Bun, PostgreSQL, Drizzle ORM for application data, Better Auth for sessions, UI for sign-up/login/reset and user-scoped task CRUD.

## Setup

1. Create a PostgreSQL database (local, Neon, Supabase PostgreSQL **without** Supabase Auth, or your own server). Create a restricted application database role.
2. `cp .env.example .env`. Fill `DATABASE_URL`, `BETTER_AUTH_URL` and **generate a strong unique** `BETTER_AUTH_SECRET` (at least 32 random bytes). In production use TLS verified for your Postgres connection.
3. Install dependencies: `bun install`.
4. Create Better Auth tables: `bun run auth:migrate` (runs `bunx auth@1.7.25 migrate --config ./src/lib/server/auth.ts`). Review the generated migration before applying it to production.
5. Create app tasks table using `psql "$DATABASE_URL" -f migrations/0001_tasks.sql` or `bun run db:push` (Drizzle config is restricted to `tasks` only).
6. Start: `bun run dev`. Create an account, sign in, and manage your tasks.
7. Run: `bun run check && bun run build`.

## Password reset

In development, reset links are logged to your **server terminal** if `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are missing. Never share those links or use this logging in production. In production, configure a verified sender with Resend; otherwise the reset operation fails safely rather than silently claiming email delivery.

## Authorization and security

- Server hooks validate Better Auth sessions and attach only the current user to `event.locals`.
- The protected layout verifies `locals.user` server-side before rendering; **every database action** independently checks the authenticated ID.
- All queries filter `tasks.user_id` to the current user. This starter uses server-only DB credentials, not a Supabase-style public Data API.
- No secret keys are exposed in the browser. Ensure a dedicated restricted DB role, HTTPS, origin/cookie settings, rate limits and email sender in production.
- Better Auth is configured with its standard PostgreSQL (`pg.Pool`) adapter. **Drizzle ORM manages application tasks**; this avoids coupling authentication database migrations to the application schema.

See `migrations/0001_tasks.sql` and `src/lib/server/auth.ts` for details. Validate against a disposable PostgreSQL database before production use.
