# Architecture decisions

## Why one repository?

One PR/issue queue, one Markdown catalog, five standalone starters. The dedicated `create-kid-starter` CLI clones a single template path with Git sparse checkout. **GitHub's `Use this template` copies the whole repository**, so the site provides per-template direct CLI commands instead.

## What does "auth ready" mean?

A starter includes working route guards, sign in/up flows, server-side session validation, SQL policies and configuration instructions. Provider credentials and migrations remain the consumer's responsibility. Production deployments need live integration and security checks.

## Why independent folders?

A shared monorepo package would break extraction by Giget. Duplicate a little configuration until real demand justifies versioned packages.

## Why two auth libraries?

Supabase projects use Supabase Auth so SSR cookies and Postgres RLS share the same identity. Plain PostgreSQL uses Better Auth. Never enable two independent identities in one application.

## Static site content

The `website` imports Markdown via Vite `import.meta.glob`, processes frontmatter and exports one HTML page per slug. No runtime GitHub API, CMS or database needed.
