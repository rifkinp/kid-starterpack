# Contributing

1. Open an issue describing the new stack or a bug.
2. Keep each template completely self-contained: no import outside its root folder.
3. Add or update exactly one `content/*.md` metadata entry for each template.
4. Provide `.env.example` when configuration is required, never real secrets.
5. Run `bun install`, `bun run check` (where applicable), and `bun run build`/`bun test`.
6. Document authentication boundaries, external services, RLS and deployment assumptions.
7. Submit a PR with reproduction steps and screenshots for UI changes.
