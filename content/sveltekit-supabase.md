---
slug: sveltekit-supabase
title: SvelteKit + Supabase
category: Fullstack
level: auth
stack: SvelteKit + Supabase Auth
description: An auth-ready web application with account settings, email confirmation routes, private notes and row-level security.
path: templates/fullstack/sveltekit-supabase
tags: ["SvelteKit", "Bun", "Supabase", "PostgreSQL", "Tailwind"]
featured: true
---
## What you get

Protected dashboard and per-user notes. Supabase cookie SSR and strict RLS keep each account isolated.

Account settings support display-name updates, email-based password recovery and sign-out of other devices. Confirmation routes support PKCE or configured token-hash email templates. Supabase provider and inbox verification remain setup requirements.

## Configuration

Supabase project and database migration required.

## Getting started

1. Copy the direct Kid StarterPack CLI command from this page (it skips the wizard).
2. Install the dependencies with `bun install`.
3. Follow the template's README for environment variables, migrations and local development.
4. Run `bun run dev` (Elysia uses the same command) and begin building.

## Before production

Review authentication, secrets, security policies, dependency locks and deployment settings. See the [release checklist](https://github.com/rifkinp/kid-starterpack/blob/main/docs/release-checklist.md).
