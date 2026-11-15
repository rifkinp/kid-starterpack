# Deployment

## Website

The website uses SvelteKit `adapter-static`. `cd website && bun install && bun run build` generates `website/build/`. Deploy it to any static host. With GitHub Pages project subpaths, configure `paths.base` or prefer a custom domain. Replace all `rifkinp` examples after publishing.

## Vercel (manual import from GitHub)

1. Import `rifkinp/kid-starterpack` from GitHub in the Vercel dashboard.
2. Set **Root Directory** to `website`.
3. Select **Framework Preset: Other** (static build) and configure:
   - Install Command: `bun install --frozen-lockfile`
   - Build Command: `bun run build`
   - Output Directory: `build`
4. Add `VITE_GITHUB_OWNER=rifkinp`. Leave `VITE_BASE_PATH` unset for a root-domain deployment.
5. Deploy. Only the catalog website is deployed, not the independent starter templates.

Use Bun 1.4.4, matching `website/package.json` and CI. Enable **Include source files outside of the Root Directory in the Build Step** so Vite can read `../content/*.md`. The root maintenance manifest does not define a workspace and is not needed by the website build. Build success verifies the static catalog, not authentication in the independent starters.

GitHub Pages workflow is optional and manually triggered; it will not auto-deploy when Vercel is being used.

## Templates

SvelteKit frontend/fullstack starters use `@sveltejs/adapter-auto` for supported environments; for a Bun VPS replace with a suitable Bun/Node adapter and verify deployment output, SSR cookie behavior, trusted proxy headers and TLS. Elysia runs with `bun run start` behind a reverse proxy.

## Environment variables

Never use secret DB credentials in public env variables. Supabase browser and SSR publishable keys may be exposed, but security relies on RLS, not secret key concealment.

## Reliability

The CI workflow tests projects independently. Provision disposable auth/DB environments and browser E2E tests before calling the auth-ready starters production-ready. See release checklist.
