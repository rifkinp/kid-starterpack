---
slug: sveltekit-supabase
title: SvelteKit + Supabase
category: Fullstack
level: auth
stack: SvelteKit + Supabase Auth
description: An auth-ready web application with sign-in, sign-up, dashboard, notes and row-level security.
path: templates/fullstack/sveltekit-supabase
tags: ["SvelteKit", "Bun", "Supabase", "PostgreSQL", "Tailwind"]
featured: true
---
## What you get

Protected dashboard and per-user notes. Supabase cookie SSR and strict RLS keep each account isolated.

## Configuration

Supabase project and database migration required.

## Getting started

1. Copy the Giget command below from the GitHub repo.
2. Install the dependencies with `bun install`.
3. Follow the template's README for environment variables, migrations and local development.
4. Run `bun run dev` (Elysia uses the same command) and begin building.

## Before production

Review authentication, secrets, security policies, dependency locks and deployment settings. See the [release checklist](https://github.com/rifkinp/kid-starterpack/blob/main/docs/release-checklist.md).
