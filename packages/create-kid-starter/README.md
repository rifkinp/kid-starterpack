# create-kid-starter

First-party CLI for the open-source [Kid StarterPack](https://github.com/rifkinp/kid-starterpack) monorepo.

**Status:** [0.1.1 is published on npm](https://www.npmjs.com/package/create-kid-starter), including optional Git initialization in the wizard and the direct-copy `--git` flag.

## Wizard

```bash
npm create kid-starter@latest
```

Choose a template and project directory, answer **Initialize Git repository? [y/N]**, then optionally install dependencies. Git initialization is opt-in and creates a fresh repository on `main`, without copying upstream history or creating a commit.

## Direct copy: skip every wizard question

```bash
npx --yes create-kid-starter@latest --template elysia-api my-api
```

Adding `--template` automatically bypasses every question, including Git initialization. If no folder is specified, the template ID is used. Git initialization and dependency installation are off by default. Add `--git` to initialize a fresh repository without prompting; the website's optional **Initialize Git repository** checkbox adds this flag automatically. `--no-git` explicitly disables it.

```bash
npx --yes create-kid-starter@latest --template elysia-api my-api --git
```

The checkbox and `--git` flag require version 0.1.1 or later; 0.1.0 does not support the flag.

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

## Publish the next version after CI passes

1. Verify the latest npm version and increment the local package version; published versions are immutable.
2. Merge the feature PR when its checks pass.
3. In this directory run `npm test`, `npm run check`, and `npm pack --dry-run`.
4. Run `npm login` and `npm publish --access public` using an npm account with publishing permissions and required security controls.
5. Verify `npm view create-kid-starter version` and update any version-specific documentation.

Never commit npm auth tokens. Prefer GitHub Actions trusted publishing for subsequent releases.
