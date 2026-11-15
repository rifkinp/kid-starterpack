# Release checklist

- [ ] Bun 1.4.4 is used; root `bun run validate`, `bun run lint`, and `bun run test` pass.
- [ ] Root, website and every starter have a committed `bun.lock`; `bun install --frozen-lockfile` passes without modifying locks.
- [ ] Website and all SvelteKit starters pass `bun run check` and `bun run build`.
- [ ] Elysia starter passes `bun test` and health/API contract checks.
- [ ] Template import paths have no dependency on monorepo siblings.
- [ ] `bun run verify:extraction` passes from isolated temporary directories, including welcome/health and 404 HTTP checks.
- [ ] After pushing, `bun run verify:giget` passes for the exact GitHub commit; transport-only tests are not equivalent to this full check.
- [ ] Supabase: sign up, confirm email, sign in, reset password, sign out, create/delete notes and cross-user RLS denial verified on a disposable Supabase project.
- [ ] Postgres: run auth migrations, Drizzle migrations, sign up/in/out, reset email transport, ensure users cannot access other users' tasks.
- [ ] Enable GitHub Dependabot and review supply-chain alerts; commit lockfiles.
- [ ] Check site static deployment, direct template URLs, copy command, keyboard navigation.
- [ ] Protect production auth paths with HTTPS, correct cookie domain, rate limiting, email controls and environment settings.

See [testing](testing.md) for commands, test scopes and disposable-provider setup. Record actual results per release; unchecked items are not implied by a green build.
