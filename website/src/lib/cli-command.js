/** @param {string} name @returns {string | null} */
export function projectNameError(name) {
  if (!name) return 'Enter a project name.';
  if (name.length > 214) return 'Use at most 214 characters.';
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
    return 'Start with a lowercase letter. Use lowercase letters, numbers and single hyphens, like my-project.';
  }
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/.test(name)) return 'This name is reserved by the operating system. Choose another name.';
  return null;
}

/** @param {string} slug @param {{directory?:string,initializeGit?:boolean,install?:boolean}} options */
export function directCopyCommand(slug, { directory = 'my-app', initializeGit = false, install = false } = {}) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid template slug');
  const error = projectNameError(directory);
  if (error) throw new Error(error);
  return `npx --yes create-kid-starter@latest --template ${slug} ${directory}${initializeGit ? ' --git' : ''}${install ? ' --install --package-manager bun' : ''}`;
}
