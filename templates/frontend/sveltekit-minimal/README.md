# Kid · SvelteKit Minimal

Independent SvelteKit 2 / Svelte 5 / Bun / Tailwind starter. No auth and no database.

```bash
bun install
bun run dev
bun run check
bun run build
```

Edit `src/routes/+page.svelte`. Deploy to a host supported by `@sveltejs/adapter-auto`, or replace the adapter for your target.

## Reproducible installation

Use Bun **1.4.4** and the included `bun.lock`. Run `bun install --frozen-lockfile` to reproduce the checked dependency graph. When deliberately changing dependencies, update the manifest and lockfile together and rerun checks. This folder does not need the monorepo root or its tooling.
