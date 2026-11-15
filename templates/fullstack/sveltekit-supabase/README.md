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

## Account settings

`/settings` lets the current user edit their display name, send a password-reset link to their account email and sign out other devices. Every server action independently validates the session with `getUser()`. Display names use `user_metadata.display_name` only for presentation: never use this editable metadata for roles or authorization. No profile table or extra schema migration is required.

Sign-out of other devices revokes their refresh sessions. Existing access tokens may remain valid until expiry; the interface does not promise instant access-token invalidation. This device stays signed in. The template does not expose an admin credential or list sessions through the admin API.

## Email confirmation and recovery across browsers

Enable **Confirm email** in the project's email-auth settings, configure an email sender, set Site URL to the application origin and allow `/auth/callback` and `/auth/confirm` on that origin. `/verify-email` resends signup confirmation links with a generic response.

The default PKCE callback works when the original browser has the code verifier. For links opened in another browser/device, configure Supabase Auth email templates to use the supplied token-hash confirmation route:

Signup confirmation:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=email">Confirm email</a>
```

Password recovery:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=recovery">Reset password</a>
```

The server validates the token with Supabase, establishes SSR cookies and redirects to a fixed local dashboard or password-update page. Invalid/expired links fail closed; arbitrary `next` URLs are ignored. Use the deployed HTTPS origin for production Site URL. Existing `/auth/callback` PKCE links remain supported.

Route tests cover these contracts with a controlled provider boundary. Actual provider configuration, delivery to an inbox and link opening across browsers still require testing on a disposable project. See the [official SSR setup](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=sveltekit) and [verifyOtp reference](https://supabase.com/docs/reference/javascript/auth-verifyotp).

## Reference

https://supabase.com/docs/guides/getting-started/tutorials/with-sveltekit

## Reproducible installation

Use Bun **1.4.4** and the included `bun.lock`. Run `bun install --frozen-lockfile` to reproduce the checked dependency graph. When deliberately changing dependencies, update the manifest and lockfile together and rerun checks. This folder does not need the monorepo root or its tooling.

Provider integration checks are available via `bun run test:integration`; see `tests/.env.example` and the repository [testing guide](https://github.com/rifkinp/kid-starterpack/blob/main/docs/testing.md). Use disposable test services only.
