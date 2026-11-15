# Contributing

1. Open an issue describing the new stack or a bug.
2. Keep each template completely self-contained: no import outside its root folder.
3. Add or update exactly one `content/*.md` metadata entry for each template, then run root `bun run sync:catalog` to regenerate the live and bundled CLI catalogs from Markdown.
4. Provide `.env.example` when configuration is required, never real secrets.
5. Use Bun 1.4.4. Set `packageManager` to `bun@1.4.4`, generate the starter's `bun.lock` with `bun install`, and include it in the PR. Verify subsequent installs with `bun install --frozen-lockfile`.
6. Document authentication boundaries, external services, RLS and deployment assumptions.
7. Submit a PR with reproduction steps and screenshots for UI changes.

From the repository root, install maintenance tooling with `bun install --frozen-lockfile`, then run `bun run validate`, `bun run lint`, `bun run test` and `bun run verify:extraction`. The last command checks the projects after copying them outside the repository; use `bun run verify:extraction templates/frontend/sveltekit-minimal` for one starter. Do not add root dependencies or sibling imports to a starter.

Catalog metadata must include non-empty `slug`, `title`, `category`, `level`, `stack`, `description` and `path`, a non-empty string array `tags`, and a boolean `featured`. Categories are `Frontend`, `Backend`, `Fullstack`; levels are `minimal`, `app`, `api`, `auth`. Slugs use lowercase kebab-case and match both the Markdown filename and template directory name. Every folder under the three template categories needs exactly one catalog entry.

The CI matrix is generated from starter directories. Adding a folder and metadata enrolls the starter automatically; supply `dev`, `check`, and `build` or `test` scripts. Auth starters also need provider-specific integration coverage described in [docs/testing.md](docs/testing.md). Do not use production credentials for these tests.
