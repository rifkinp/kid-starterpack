# Kid StarterPack Website

Static SvelteKit catalog driven by `../content/*.md`. No database, admin backend or GitHub API is used.

```bash
bun install --frozen-lockfile
bun run dev
bun run check
bun run build
```

`build/` contains the generated static site. Deploy that folder to GitHub Pages, Cloudflare Pages, Netlify or Vercel (configure static hosting). SvelteKit `adapter-static` prerenders all pages.

**Configuration:** copy `.env.example` to `.env` and set `VITE_GITHUB_OWNER` to your actual GitHub username or organization. GitHub source links derive from it at build time. The direct-copy CLI command uses template slugs; its npm package is published separately from GitHub merges. The included GitHub Pages workflow sets `VITE_BASE_PATH=/kid-starterpack` for project hosting; adjust it if you rename the repository or use a custom domain.

`content/*.md` files are sanitized on the server during the static build; never serve unreviewed HTML.

Use Bun 1.4.4. For repository-wide validation, install the separate root maintenance dependencies and run `bun run validate` from the root. No root install is required for the website's own check/build. When Vercel's Root Directory is `website`, include files outside that directory so `../content` is available.
