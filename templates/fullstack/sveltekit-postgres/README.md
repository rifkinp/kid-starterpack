# Kid · SvelteKit + PostgreSQL + Better Auth

Vendor-neutral fullstack starter: **SvelteKit + PostgreSQL + Drizzle + Better Auth + Tailwind CSS + TypeScript + Bun + tests**, with verified signup, account settings and user-scoped task CRUD.

## Included stack

| Technology | Responsibility |
| --- | --- |
| SvelteKit 2 / Svelte 5 | SSR, routes, server actions and UI |
| PostgreSQL / pg | Persistent database and server-side connection pool |
| Drizzle ORM / Drizzle Kit | Typed application queries, task schema and schema tooling |
| Better Auth | Authentication, email verification, password flows and sessions |
| Tailwind CSS 4 | Styling through `@tailwindcss/vite` |
| TypeScript | Strict application type checking |
| Bun 1.4.4 | Package installation, development and integration runner |
| Node.js Test Runner | Credential-free email-transport regression tests |
| HTTP integration suite | Real auth routes, task ownership and sessions on disposable PostgreSQL |

## Setup

1. Create a PostgreSQL database (local, Neon, Supabase PostgreSQL **without** Supabase Auth, or your own server). Create a restricted application database role.
2. `cp .env.example .env`. Fill `DATABASE_URL`, `BETTER_AUTH_URL` and **generate a strong unique** `BETTER_AUTH_SECRET` (at least 32 random bytes). In production use TLS verified for your Postgres connection.
3. Install dependencies: `bun install`.
4. Create Better Auth tables: `bun run auth:migrate` (runs `bunx auth@1.7.25 migrate --config ./src/lib/server/auth.ts`). Review the generated migration before applying it to production.
5. Create app tasks table using `psql "$DATABASE_URL" -f migrations/0001_tasks.sql` or `bun run db:push` (Drizzle config is restricted to `tasks` only).
6. Start: `bun run dev`. Create an account, open the verification link from your email (or the development terminal), then sign in and manage your tasks.
7. Run: `bun run check && bun run build`.

## Password reset

In development, verification and reset links are logged to your **server terminal** if `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are missing. Never share those links or use this logging in production. In production, configure a verified sender with Resend; otherwise the email transport fails rather than claiming delivery.

## Account settings and verified signup

- `/settings` includes display-name editing, current-password-checked password changes, active-session metadata and sign-out of other devices. Password changes revoke other sessions; raw session tokens are never serialized into settings page data.
- Names are trimmed and validated server-side (1–100 characters) on both signup and profile updates. Email addresses remain read-only in settings; changing an email needs a separate verified-address flow.
- Email verification is required by default (`REQUIRE_EMAIL_VERIFICATION=true`). Signup does not issue a session until the email is verified. `/verify-email` can request another link. Verification does not automatically sign the user in.
- Existing unverified users must verify their address before their next sign-in. No new database schema is needed. For a deliberate local experiment only, `REQUIRE_EMAIL_VERIFICATION=false` permits unverified sign-in.
- Configure a verified Resend sender before production use and test actual inbox delivery. The local integration suite captures development-only links; it does not verify external SMTP/Resend delivery.

## Authorization and security

- Server hooks validate Better Auth sessions and attach only the current user to `event.locals`.
- The protected layout verifies `locals.user` server-side before rendering; **every database action** independently checks the authenticated ID.
- All queries filter `tasks.user_id` to the current user. This starter uses server-only DB credentials, not a Supabase-style public Data API.
- No secret keys are exposed in the browser. Ensure a dedicated restricted DB role, HTTPS, origin/cookie settings, rate limits and email sender in production.
- Better Auth is configured with its standard PostgreSQL (`pg.Pool`) adapter. **Drizzle ORM manages application tasks**; this avoids coupling authentication database migrations to the application schema.

See `migrations/0001_tasks.sql` and `src/lib/server/auth.ts` for details. Validate against a disposable PostgreSQL database before production use.

## Reproducible installation

Use Bun **1.4.4** and the included `bun.lock`. Run `bun install --frozen-lockfile` to reproduce the checked dependency graph. When deliberately changing dependencies, update the manifest and lockfile together and rerun checks. This folder does not need the monorepo root or its tooling.

## Checks and tests

After installing dependencies:

```bash
bun run check
bun run test
bun run build
```

`bun run test` uses Node.js Test Runner to check production email failures and development-link handling without provider credentials or a database. Use Node.js 22+ for this test command. `bun run check` checks Svelte and TypeScript, including strict typing; the build also compiles Tailwind styles.

For the HTTP integration suite, create an empty disposable PostgreSQL database whose name starts with `kid_test_`, copy `tests/.env.example` to `tests/.env`, then run:

```bash
bun --env-file=tests/.env run test:integration
```

This suite applies auth/app migrations and exercises verified signup, sign-in/out, profile validation, password changes/recovery, session revocation, task CRUD and denial of access across two users. CI runs it on PostgreSQL 17. Never point it at an application or production database. See the repository [testing guide](https://github.com/rifkinp/kid-starterpack/blob/main/docs/testing.md) for details and verification limits.
