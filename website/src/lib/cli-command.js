/** @param {string} slug @param {boolean} initializeGit */
export function directCopyCommand(slug, initializeGit = false) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid template slug');
  return `npx --yes create-kid-starter@latest --template ${slug} my-app${initializeGit ? ' --git' : ''}`;
}
