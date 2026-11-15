---
slug: sveltekit-postgres
title: SvelteKit + PostgreSQL
category: Fullstack
level: auth
stack: SvelteKit + PostgreSQL + Drizzle + Better Auth + Tailwind CSS + TypeScript + Bun + Testing
description: A SvelteKit and PostgreSQL starter with Drizzle, Better Auth, Tailwind CSS, TypeScript, Bun, and unit/integration tests.
path: templates/fullstack/sveltekit-postgres
tags: ["SvelteKit", "PostgreSQL", "Drizzle", "Better Auth", "Tailwind CSS", "TypeScript", "Bun", "Testing"]
featured: false
---
## What you get

A vendor-neutral choice if you want to bring your own PostgreSQL database, self-host or deploy to Neon.

## Included stack

- **SvelteKit + Svelte 5:** application routes, SSR and responsive account/dashboard pages.
- **PostgreSQL + Drizzle ORM:** persistent, owner-scoped application data and typed queries.
- **Better Auth:** verified signup, sign-in, password recovery and server-side sessions.
- **Tailwind CSS 4:** styling through the Tailwind Vite plugin.
- **TypeScript:** strict type checking for application code.
- **Bun:** pinned package manager and local development commands, with a standalone lockfile.
- **Tests:** Node.js Test Runner for email-transport regression tests and HTTP integration checks against a disposable PostgreSQL database.

Email verification is required by default. Account settings include display-name updates, password changes and active-session management. Configure the email sender and verify deployment behavior before production use.

## Configuration

PostgreSQL database and authentication migrations required.

## Getting started

1. Copy the direct Kid StarterPack CLI command from this page (it skips the wizard).
2. Install the dependencies with `bun install`.
3. Follow the template's README for environment variables, migrations and local development.
4. Run `bun run dev` and begin building.

## Checks and tests

Run `bun run check`, `bun run test` and `bun run build` after installation. These checks do not require an external database. For full authentication, ownership and session tests, configure an empty disposable `KID_TEST_DATABASE_URL` database as described in the starter README, then run `bun run test:integration`. CI also runs the integration suite on PostgreSQL 17.

## Before production

Review authentication, secrets, security policies, dependency locks and deployment settings. See the [release checklist](https://github.com/rifkinp/kid-starterpack/blob/main/docs/release-checklist.md).
