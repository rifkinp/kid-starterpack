# Kid · SvelteKit App Shell

Responsive application shell with dashboard cards, sidebar and functional localStorage task CRUD. **No auth or external database**: the local task demo is only UI state, not a secure multiuser application.

```bash
bun install
bun run dev
bun run check
bun run build
```

Start in `src/routes/+page.svelte` and replace local storage with your own API/DB. SvelteKit server rendering is enabled; browser storage is read in `onMount`.

## Reproducible installation

Use Bun **1.4.4** and the included `bun.lock`. Run `bun install --frozen-lockfile` to reproduce the checked dependency graph. When deliberately changing dependencies, update the manifest and lockfile together and rerun checks. This folder does not need the monorepo root or its tooling.
