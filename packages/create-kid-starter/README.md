# create-kid-starter

First-party CLI for the open-source [Kid StarterPack](https://github.com/rifkinp/kid-starterpack) monorepo.

**Status: source available on GitHub; not yet published to npm.** Verify package name availability before the first release.

## Wizard

```bash
npm create kid-starter@latest
```

Choose a template, a project directory, and optionally install dependencies.

## Direct copy: skip every wizard question

```bash
npx --yes create-kid-starter@latest --template elysia-api my-api
```

Adding `--template` automatically bypasses the wizard. If no folder is specified, the template ID is used. Dependencies are not installed by default.

```bash
npx --yes create-kid-starter@latest -t sveltekit-supabase my-app --install
```

Other flags: `--list`, `--ref <branch>`, `--package-manager bun|npm|pnpm`, `--dir <path>`, `--help`.

## Run directly from the GitHub source

```bash
node packages/create-kid-starter/bin/create-kid-starter.mjs --list
node packages/create-kid-starter/bin/create-kid-starter.mjs --template elysia-api my-api
```

Run from the repository root. Requires Node.js 20+ and Git. There are no third-party CLI runtime dependencies or build steps.

## How it works

The CLI reads the live `catalog/templates.json` registry from `main`, falling back to the bundled catalog on network failure. It uses native `git clone --filter=blob:none --sparse`, selects the requested folder with `git sparse-checkout set`, and copies that folder without its Git history.

Security policies: strictly allowlisted template IDs/paths, no overwriting existing output, no output path traversal, no symlinked template files, no automatic dependency installation. Downloaders cannot guarantee template dependencies are safe: review scripts and credentials before running.

## Publish to npm (once, after CI passes)

1. Verify the availability and ownership of `create-kid-starter` in npm; use a scoped name if required.
2. Merge the feature PR when its checks pass.
3. In this directory run `npm test`, `npm run check`, and `npm pack --dry-run`.
4. Run `npm login` and `npm publish --access public` using an npm account with publishing permissions and required security controls.
5. Verify `npm view create-kid-starter version` and update the website's release notice.

Never commit npm auth tokens. Prefer GitHub Actions trusted publishing for subsequent releases.
