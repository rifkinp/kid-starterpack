# Kid · SvelteKit + Supabase (Auth Ready)

SvelteKit 2, Svelte 5, Bun, Tailwind, Supabase Auth with SSR cookie sessions, sign-in, sign-up, forgot/reset password, protected dashboard and per-user notes protected by PostgreSQL RLS.

## Setup

1. Create a Supabase project. In **Project Settings → API** locate its URL and **publishable** key. Do **not** expose secret or `service_role` keys.
2. `cp .env.example .env` and set the two `PUBLIC_` values.
3. Run `supabase/migrations/0001_notes.sql` in Supabase SQL Editor; review RLS, grants and project settings.
4. In Supabase Auth URL settings set Site URL to `http://localhost:5173` and allow `http://localhost:5173/auth/callback` in redirect URLs. Configure email sending/confirmations as required.
5. Install and run:

```bash
bun install
bun run dev
bun run check
bun run build
```

## Security model

- Each SSR request receives its own Supabase client from `@supabase/ssr`; auth sessions are stored in cookies.
- Protected pages and mutations call `supabase.auth.getUser()` (network validation), not `getSession()` for authorization.
- Notes table grants only the authenticated role and RLS policies check `auth.uid()` for **all** operations. Views and other public tables must be audited independently.
- User-supplied redirect paths are allowlisted, preventing open redirects.
- Deploy behind HTTPS, configure Auth redirect origins and verify email delivery; server responses mark private content as no-store.

## Demo contract

Welcome page renders even before keys are set; auth operations require actual Supabase credentials. We do not ship credentials, a pre-existing DB or fake auth users. Run signup, email confirmation, reset password, cross-user RLS and sign-out integration tests on a disposable project before production.

## Reference

https://supabase.com/docs/guides/getting-started/tutorials/with-sveltekit

## Reproducible installation

Use Bun **1.4.4** and the included `bun.lock`. Run `bun install --frozen-lockfile` to reproduce the checked dependency graph. When deliberately changing dependencies, update the manifest and lockfile together and rerun checks. This folder does not need the monorepo root or its tooling.

Provider integration checks are available via `bun run test:integration`; see `tests/.env.example` and the repository [testing guide](https://github.com/rifkinp/kid-starterpack/blob/main/docs/testing.md). Use disposable test services only.
