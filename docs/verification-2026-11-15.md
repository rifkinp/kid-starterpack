# Local release-hardening verification — 15 November 2026

Base: `main` commit `8d7ce621f953a50f977ba2ae405600da5b173de5`. Changes are local on `fix/release-verification`; no new push, GitHub Actions run or deployment is claimed by this report.

## Results

| Check | Result | Scope |
| --- | --- | --- |
| Dependency installation | Passed | Root maintenance tooling, website and all five independent starters; Bun 1.4.4, seven separate lockfiles. |
| Frozen installation | Passed | Root and all five isolated starter copies. Website frozen installation checked separately. |
| Catalog validation | Passed | Five folders and five descriptors; required metadata/types, canonical paths, duplicates, manifests and orphan detection. |
| Root regression tests | 21 passed | Metadata contracts, fixture failures, workflow YAML and dynamic discovery consistency. |
| Supabase route regression | 4 passed | Actual password-reset action loaded through Vite, with provider/network failures and successful/invalid requests. Two failure cases were reproduced before the fix. |
| Elysia unit tests | 2 passed | Health contract and task create/list. |
| Lint | Passed | Oxlint with warnings denied; Svelte markup/types are checked by svelte-check. |
| Website check/build | Passed | No Svelte errors/warnings; static catalog output generated. |
| Starter extraction | Passed for all five | Fresh copies outside the repository; frozen install, check, available tests, build where applicable and HTTP welcome/health 200 plus 404. Fullstack welcome pages were checked without provider credentials. |
| Giget transport | Passed for all five | Exact baseline GitHub commit; selected subfolder only, matching manifest identity, no monorepo/history files. |
| PostgreSQL HTTP integration | Passed on PostgreSQL WASM | Real Better Auth/app migrations and HTTP routes via pg protocol to a temporary PGlite 0.3.14 server: two users, ownership denial, CRUD, signup/login/logout, single-use reset token and old-session revocation. |
| Source hygiene | Passed | No code file exceeds 400 lines; diff whitespace check passes. |

## Limits and remaining external verification

- Native PostgreSQL 15.2 `initdb` could not initialize in this Windows execution environment: restricted-token/version-probe startup errors. The successful PostgreSQL WASM test is useful integration evidence, but does not replace native PostgreSQL 17 CI or deployment checks. The new CI job provisions an empty ephemeral database and runs the same HTTP integration suite.
- Supabase provider/RLS integration is prepared but **not run**. The owner confirmed there is no disposable Supabase project and requested preparation only. Its manual workflow requires an isolated project, the notes migration and test-only secrets.
- Supabase provider tests intentionally use admin-confirmed test users and generated recovery tokens. SMTP delivery, signup confirmation emails, actual browser SSR/PKCE recovery, HTTPS cookies, clipboard/search interactions and production rate limits still need separate checks.
- Giget transport tested the existing remote baseline. The full frozen-install/check/build run against a downloaded **new** commit can only run after that commit is pushed. Local modified-source extraction has passed; the push workflow will run the full remote check.
- Adapter-auto completed the fullstack/frontend builds but reported no detected production target locally. Configure and verify the intended adapter/host before claiming a deployable production artifact.
- The Better Auth dependency emitted unused-import build warnings. Application Svelte checks and lint passed; the warnings were not suppressed.

The machine's system trust certificates were used for local registry/Git access. TLS verification stayed enabled. Local probe tools and generated certificates live outside the repository under the parent workspace's `.audit-cache`; they are not starter dependencies or release files.

## Reproduction

Use [testing.md](testing.md) for maintained commands and provider setup. The code changes add no production database migration. New root development dependencies are Giget and Oxlint, plus the catalog's existing gray-matter parser as an explicit maintenance dependency. CI and test-only environment examples changed; application production environment variables did not.

Relevant upstream references: [Bun lockfiles](https://bun.sh/docs/pm/lockfile), [Supabase resetPasswordForEmail](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), and [Better Auth programmatic migrations](https://better-auth.com/docs/concepts/database#programmatic-migrations). Runtime/API details were also checked against the installed pinned packages.
