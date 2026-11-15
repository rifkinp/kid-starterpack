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

## Download one template

Repository owner: `rifkinp`.

```bash
npx giget@latest gh:rifkinp/kid-starterpack/templates/frontend/sveltekit-minimal my-app
cd my-app
bun install
bun run dev
```

Giget copies **only the selected folder**, without the parent repository's Git history. To avoid mutable downloads in automated setups, pin a reviewed Git commit or release where supported, and audit external dependencies before production use.

## Publish to GitHub

See [`docs/publish-to-github.md`](docs/publish-to-github.md) for `git init`, optional GitHub CLI setup and GitHub Pages deployment.

## Website

```bash
cd website
bun install
bun run dev
```

This SvelteKit website builds a static catalog from `/content/*.md`, with no database, API key, admin console or CMS. Set `VITE_GITHUB_OWNER` in `website/.env` before deployment; it controls GitHub and Giget links. `bun run build` exports it to `website/build`. For a new template, add a self-contained folder under `templates/` and a Markdown file under `content/`.

## Repository structure

```text
kid-starterpack/
├── website/                 # SvelteKit static catalog
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
- `templates/` are intentionally **not linked** by shared relative imports so Giget extraction works.

## Important

This source release was assembled in an environment without package registry access. Files and references were statically inspected, but dependency installation, framework compilation, auth provider integration and end-to-end tests **must be verified in CI before describing this as production-ready**. See [release checklist](docs/release-checklist.md).

## License

MIT — see [`LICENSE`](LICENSE). Review third-party package and asset licenses separately.
