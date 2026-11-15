# Release checklist

- [ ] `node scripts/validate.mjs` passes.
- [ ] Each `bun install` resolves from a package registry; commit generated `bun.lock` after successful install.
- [ ] Website and all SvelteKit starters pass `bun run check` and `bun run build`.
- [ ] Elysia starter passes `bun test` and health/API contract checks.
- [ ] Template import paths have no dependency on monorepo siblings.
- [ ] Supabase: sign up, confirm email, sign in, reset password, sign out, create/delete notes and cross-user RLS denial verified on a disposable Supabase project.
- [ ] Postgres: run auth migrations, Drizzle migrations, sign up/in/out, reset email transport, ensure users cannot access other users' tasks.
- [ ] Enable GitHub Dependabot and review supply-chain alerts; commit lockfiles.
- [ ] Check site static deployment, direct template URLs, copy command, keyboard navigation.
- [ ] Protect production auth paths with HTTPS, correct cookie domain, rate limiting, email controls and environment settings.
