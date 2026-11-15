---
slug: sveltekit-postgres
title: SvelteKit + PostgreSQL
category: Fullstack
level: auth
stack: SvelteKit + Drizzle + Better Auth
description: A portable fullstack starter with verified signup, account settings, session management and a protected PostgreSQL tasks dashboard.
path: templates/fullstack/sveltekit-postgres
tags: ["SvelteKit", "Bun", "PostgreSQL", "Drizzle", "Better Auth"]
featured: false
---
## What you get

A vendor-neutral choice if you want to bring your own PostgreSQL database, self-host or deploy to Neon.

Email verification is required by default. Account settings include display-name updates, password changes and active-session management. Configure the email sender and verify deployment behavior before production use.

## Configuration

PostgreSQL database and authentication migrations required.

## Getting started

1. Copy the direct Kid StarterPack CLI command from this page (it skips the wizard).
2. Install the dependencies with `bun install`.
3. Follow the template's README for environment variables, migrations and local development.
4. Run `bun run dev` (Elysia uses the same command) and begin building.

## Before production

Review authentication, secrets, security policies, dependency locks and deployment settings. See the [release checklist](https://github.com/rifkinp/kid-starterpack/blob/main/docs/release-checklist.md).
