# Kid · SvelteKit App Shell

Responsive application shell with dashboard cards, sidebar and functional localStorage task CRUD. **No auth or external database**: the local task demo is only UI state, not a secure multiuser application.

```bash
bun install
bun run dev
bun run check
bun run build
```

Start in `src/routes/+page.svelte` and replace local storage with your own API/DB. SvelteKit server rendering is enabled; browser storage is read in `onMount`.
