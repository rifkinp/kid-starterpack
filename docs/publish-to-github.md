# Publish Kid StarterPack on GitHub

This bundle is not already pushed to your account. Extract the ZIP, then run from `kid-starterpack/`:

```bash
git init -b main
git add .
git commit -m "Initial Kid StarterPack release"
# Using GitHub CLI after authenticating:
gh repo create kid-starterpack --public --source=. --remote=origin --push
```

Or create a blank GitHub repository through the website and follow its push instructions.

## Publish the catalog via GitHub Pages

- This repository includes `.github/workflows/pages.yml`.
- GitHub repository **Settings → Pages → Build and deployment → GitHub Actions**.
- On push to main, the workflow builds `website/` with `VITE_GITHUB_OWNER=${{ github.repository_owner }}` and `VITE_BASE_PATH=/kid-starterpack`.
- The expected URL is `https://rifkinp.github.io/kid-starterpack/`.
- If you choose a different repository name or a custom domain, adjust `VITE_BASE_PATH` in the workflow (`''` for a root custom domain).
- Markdown entries in `/content` are the source of catalog pages. Every content change triggers an updated build.

## Local development

```bash
cd website
cp .env.example .env
# set VITE_GITHUB_OWNER to your GitHub account
bun install
bun run dev
```

Do not paste personal access tokens into repository source or `.env.example`.
