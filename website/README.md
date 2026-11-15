# Kid StarterPack Website

Static SvelteKit catalog driven by `../content/*.md`. No database, admin backend or GitHub API is used.

```bash
bun install
bun run dev
bun run check
bun run build
```

`build/` contains the generated static site. Deploy that folder to GitHub Pages, Cloudflare Pages, Netlify or Vercel (configure static hosting). SvelteKit `adapter-static` prerenders all pages.

**Configuration:** copy `.env.example` to `.env` and set `VITE_GITHUB_OWNER` to your actual GitHub username or organization. The catalog, commands and navigation derive from it at build time. The included GitHub Pages workflow sets `VITE_BASE_PATH=/kid-starterpack` for project hosting; adjust it if you rename the repository or use a custom domain.

`content/*.md` files are sanitized on the server during the static build; never serve unreviewed HTML.
