# Release verification

Use Bun **1.4.4** and Node **22 or later** for maintenance scripts. Install each project independently; the root is not a workspace and supplies no runtime dependencies to starters.

## Checks without credentials

From the repository root:

```bash
bun install --frozen-lockfile
bun run validate
bun run lint
bun run test
cd website
bun install --frozen-lockfile
bun run check
bun run build
cd ..
bun run verify:extraction
```

Oxlint checks JavaScript/TypeScript maintenance and application code. Svelte markup and component types are checked by each application's `svelte-check` command. The extraction runner discovers starter directories, copies each into its own temporary project, installs frozen dependencies, runs checks and available unit tests, builds SvelteKit applications, starts the welcome/health endpoint, checks HTTP 200 and 404, then stops the server and removes the temporary directory. It clears inherited database/auth configuration and excludes local environment files. It does not establish a production deployment adapter or browser behavior.

`KID_VERIFY_TMPDIR` can point to a writable temporary directory outside the repository when Windows tool access to the default temporary directory is restricted. `BUN_INSTALL_CACHE_DIR` may select a writable Bun cache. Use the machine's trusted CA configuration for registry access; never disable TLS verification.

`bun run verify:giget` downloads the five folders at `GITHUB_SHA` (or local Git HEAD) and repeats the isolated checks. Run it after the commit exists on GitHub. The push workflow does this automatically. `bun run verify:giget --transport-only` checks remote folder selection and absence of monorepo/history files, but deliberately skips install/check/build; it is useful before local changes are pushed and must not be reported as the full distribution check.

The validator and website share frontmatter validation. Missing fields, wrong types, unknown categories/readiness levels, unsafe paths, duplicate slugs/targets and orphan catalog entries/folders fail checks. Root regression tests use temporary fixtures; they do not rewrite catalog sources.

## Supabase route regression tests

```bash
cd templates/fullstack/sveltekit-supabase
bun run test
```

These tests execute the actual forgot-password server action through Vite with a controlled provider boundary: provider failure, network failure, generic successful responses/recovery redirect and invalid input. They require no external project or email transport.

## PostgreSQL HTTP integration

Create an **empty disposable database** whose name starts with `kid_test_`. The runner refuses other names and non-empty public schemas. Export its connection URL as `KID_TEST_DATABASE_URL`, then:

```bash
cd templates/fullstack/sveltekit-postgres
bun install --frozen-lockfile
bun run test:integration
```

Alternatively, copy `tests/.env.example` to `tests/.env` and run `bun --env-file=tests/.env run test:integration`. Keep credentials out of Git. The runner generates an isolated auth secret, applies the real auth/app migrations, starts the actual SvelteKit app on a random local port and tests unauthenticated denial, two accounts, task CRUD, foreign reads/updates/deletes, sign-out/login, development reset links, single-use reset tokens and old-session revocation. It stops the app afterward. The disposable database remains for inspection; delete it through the tool that provisioned it. Never use an application database. CI provisions PostgreSQL 17 as an ephemeral service automatically.

Development reset-link capture verifies token handling, not production email delivery. Verify Resend sender settings and real inbox delivery separately.

## Supabase provider and RLS integration

Use a **dedicated disposable Supabase project**, apply the supplied notes migration, then configure the values in `templates/fullstack/sveltekit-supabase/tests/.env.example`. The admin key is used only by the test runner to create and remove its own users; it is never passed to the application or browser.

```bash
cd templates/fullstack/sveltekit-supabase
bun --env-file=tests/.env run test:integration
```

This suite requires explicit `KID_TEST_SUPABASE_DISPOSABLE=yes`. It creates two unique test users, checks sign-in, owner CRUD, anonymous/foreign access denial, forged ownership and owner reassignment denial, provider recovery tokens, password replacement and sign-out. Its cleanup deletes only the user IDs created by that run. An interrupted run may leave `kid-test-*` users: inspect and remove only those test users from the disposable project.

The manual **Verify disposable Supabase** workflow reads the three test credentials from the `supabase-test` GitHub environment. Configure `KID_TEST_SUPABASE_URL`, `KID_TEST_SUPABASE_PUBLISHABLE_KEY`, and `KID_TEST_SUPABASE_ADMIN_KEY` there. It has no production defaults and is not run on pull requests. This provider test uses admin-confirmed users and generated recovery tokens; SMTP delivery, signup confirmation links and the browser's SSR/PKCE recovery callback are **not** covered. Verify these separately before a production-ready claim.

## Browser and deployment checks

Check mobile/desktop navigation, keyboard focus, catalog search/category filters, clipboard success/failure feedback, direct detail URLs and the generated static site. For auth starters, test confirmation and recovery links from an actual test inbox, HTTPS cookies, redirect allowlists and provider rate limits on the intended host. A compile or HTTP smoke test does not substitute for these checks.
