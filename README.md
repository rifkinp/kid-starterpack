# Kid StarterPack

**Open-source starter ecosystem. One GitHub repository. Independent templates.**

![status](https://img.shields.io/badge/status-preview-7468fa) ![license](https://img.shields.io/badge/license-MIT-222)

Kid StarterPack contains a Markdown-driven static catalog site and five standalone web app starters. Each folder under `templates/` is designed to work **after extraction without the monorepo**.

## Templates

| Template | Level | Stack | Setup |
| --- | --- | --- | --- |
| [`sveltekit-minimal`](templates/frontend/sveltekit-minimal) | Welcome | SvelteKit + Bun + Tailwind | No account |
| [`sveltekit-app`](templates/frontend/sveltekit-app) | App ready | SvelteKit + local task demo | No account |
| [`elysia-api`](templates/backend/elysia-api) | API ready | Elysia + Bun + OpenAPI | No account |
| [`sveltekit-supabase`](templates/fullstack/sveltekit-supabase) | Auth ready | SvelteKit + Supabase SSR + RLS | Supabase project |
| [`sveltekit-postgres`](templates/fullstack/sveltekit-postgres) | Auth ready | SvelteKit + PostgreSQL + Drizzle + Better Auth | PostgreSQL |

## First-party Kid StarterPack CLI

This repository now contains the open-source `create-kid-starter` CLI in `packages/create-kid-starter`.
It uses native Git sparse checkout to copy **only one selected template folder**, without Giget.

### Interactive wizard

The CLI is available on [npm](https://www.npmjs.com/package/create-kid-starter):

```bash
npm create kid-starter@latest
```

Select a template, name the project, choose whether to initialize a fresh Git repository (default: no), and optionally install dependencies.

### Direct copy — skip the wizard completely

Copy the command on any template detail page:

```bash
npx --yes create-kid-starter@latest --template elysia-api my-api
cd my-api
bun install
bun run dev
```

When `--template` is supplied, **no wizard or setup questions are shown**, even when project name is omitted (the template ID is used as the folder name). Dependencies are not installed unless `--install` is specified.

### Use the latest CLI source locally

```bash
git clone https://github.com/rifkinp/kid-starterpack.git
cd kid-starterpack
node packages/create-kid-starter/bin/create-kid-starter.mjs --list
node packages/create-kid-starter/bin/create-kid-starter.mjs --template elysia-api my-api
```

The CLI requires Node.js 20+ and Git. It does **not** need a build step or third-party runtime dependencies. Run `node --test` inside `packages/create-kid-starter` for CLI tests.

**npm status:** Version **0.1.0** is published. The optional Git initialization added here is prepared for **0.1.1** and is available from the repository until that version is published. See the [CLI publishing guide](packages/create-kid-starter/README.md).

### Available now: Giget fallback

Giget remains available as an alternative downloader:

```bash
npx giget@latest gh:rifkinp/kid-starterpack/templates/backend/elysia-api my-api
```

## Publish to GitHub

See [`docs/publish-to-github.md`](docs/publish-to-github.md) for `git init`, optional GitHub CLI setup and GitHub Pages deployment.

## Website

```bash
cd website
bun install
bun run dev
```

This SvelteKit website builds a static catalog from `/content/*.md`, with no database, API key, admin console or CMS. Set `VITE_GITHUB_OWNER` in `website/.env` before deployment; it controls GitHub source links. `bun run build` exports it to `website/build`. For a new template, add a standalone folder under `templates/`, a Markdown descriptor under `content/`, and a matching entry in `catalog/templates.json`. The CLI downloads the live catalog, so new templates do not require an npm release.

## Repository structure

```text
kid-starterpack/
├── website/                 # SvelteKit static catalog
├── packages/create-kid-starter/ # CLI wizard + direct-copy generator
├── catalog/templates.json   # Live CLI template registry
├── content/                 # Markdown catalog source
├── templates/
│   ├── frontend/
│   ├── backend/
│   └── fullstack/
├── scripts/validate.mjs     # Check template completeness and metadata
└── .github/workflows/       # Validation workflows
```

## Quality and security

- Every starter has its own dependency manifest, setup guide, environment example if needed, and Git ignore rules.
- Never publish real `.env`, Supabase `service_role` keys, or database passwords.
- Supabase data access uses owner-scoped RLS policies. PostgreSQL starter checks the session server-side and restricts task access by the user's id.
- CI checks catalog paths and template scripts, and runs `bun install` / checks per template when GitHub Actions has network access.
- Use **Bun 1.4.4** and commit each application's `bun.lock`. CI uses `bun install --frozen-lockfile`.
- Root maintenance dependencies are tooling only; no starter imports them or needs the root manifest after extraction.
- `templates/` are intentionally **not linked** by shared relative imports so Giget extraction works.

## Important

The baseline commit `8d7ce62` passed website/starter CI, and the local release-hardening checks are recorded in [verification results](docs/verification-2026-11-15.md). Build success does not establish production readiness: disposable-provider integration, email delivery, browser flows and deployment security have separate requirements. See the [release checklist](docs/release-checklist.md).

## Maintainer checks

```bash
bun install --frozen-lockfile
bun run validate
bun run lint
bun run test
bun run verify:extraction
```

The extraction check installs, checks, tests, builds and smoke-tests every starter in a temporary directory outside the repository. CI discovers its matrix from the actual folders, so new starters do not require a hardcoded matrix edit. `bun run verify:giget` repeats those checks after downloading each folder from the exact pushed commit. See [testing](docs/testing.md) for provider tests and local prerequisites.

## License

MIT — see [`LICENSE`](LICENSE). Review third-party package and asset licenses separately.
