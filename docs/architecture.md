# Architecture decisions

## Why one repository?

One PR/issue queue, one Markdown catalog, five standalone starters. The dedicated `create-kid-starter` CLI clones a single template path with Git sparse checkout. **GitHub's `Use this template` copies the whole repository**, so the site provides per-template direct CLI commands instead.

## What does "auth ready" mean?

A starter includes working route guards, sign in/up flows, server-side session validation, SQL policies and configuration instructions. Provider credentials and migrations remain the consumer's responsibility. Production deployments need live integration and security checks.

## Why independent folders?

A shared monorepo package would break independent template extraction. Keep each starter self-contained; the CLI lives separately under `packages/create-kid-starter`.

## Why two auth libraries?

Supabase projects use Supabase Auth so SSR cookies and Postgres RLS share the same identity. Plain PostgreSQL uses Better Auth. Never enable two independent identities in one application.

## Static site content

The `website` imports Markdown via Vite `import.meta.glob`, processes frontmatter and exports one HTML page per slug. No runtime GitHub API, CMS or database needed.

The website and repository validator share `website/src/lib/catalog-metadata.js` to enforce the same frontmatter types and Giget path rules. This is catalog tooling, not a dependency of the standalone starters. The root manifest contains maintenance tooling only and declares no Bun workspaces. Each application owns its own lockfile and dependency installation.

Markdown remains the metadata source of truth. `bun run sync:catalog` generates `catalog/templates.json` and the CLI's bundled fallback from it; validation rejects drift in either artifact. The CLI reads the live JSON without adding a runtime API to the static website. Its wizard offers optional fresh Git initialization; `--template` direct copy asks no questions and only initializes Git when `--git` is explicitly supplied. The website checkbox is off by default and adds that flag to both the displayed and copied command.
