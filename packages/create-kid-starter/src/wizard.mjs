import { createInterface } from 'node:readline/promises';

export async function promptForOptions(catalog, {
  input = process.stdin, output = process.stdout, createPrompt = createInterface
} = {}) {
  if (!input.isTTY || !output.isTTY) {
    throw new Error('Interactive wizard requires a terminal. Use --template <id> <directory> for automation.');
  }
  const prompt = createPrompt({ input, output });
  try {
    output.write('\n  KID STARTERPACK  —  interactive project generator\n\n');
    catalog.forEach((item, index) => output.write(`  ${index + 1}) ${item.title}  [${item.id}]\n`));
    const choice = (await prompt.question('\n  Choose a template [1]: ')).trim() || '1';
    const index = Number(choice) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= catalog.length) throw new Error('Invalid template selection');
    const directory = (await prompt.question('  Project directory [my-app]: ')).trim() || 'my-app';
    const gitAnswer = (await prompt.question('  Initialize Git repository? [y/N]: ')).trim().toLowerCase();
    const installAnswer = (await prompt.question('  Install dependencies using Bun? [y/N]: ')).trim().toLowerCase();
    return {
      template: catalog[index], directory,
      initializeGit: gitAnswer === 'y' || gitAnswer === 'yes',
      install: installAnswer === 'y' || installAnswer === 'yes'
    };
  } finally {
    prompt.close();
  }
}
