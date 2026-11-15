import fs from 'node:fs';
import path from 'node:path';
import { discoverTemplates, repositoryRoot } from './validate.mjs';
import { verifyProject } from './project-checks.mjs';
import { createTemporary, removeTemporary } from './temporary.mjs';

const folders = discoverTemplates(repositoryRoot);
const selected = process.argv[2] ? folders.filter(folder => folder === process.argv[2]) : folders;
if (!selected.length) throw new Error('No matching starter');
for (const folder of selected) {
  const temporary = createTemporary('kid-extraction-');
  try {
    const target = path.join(temporary, 'my-app');
    fs.cpSync(path.join(repositoryRoot, folder), target, {
      recursive: true,
      filter: source => {
        const name = path.basename(source);
        return !['node_modules', '.svelte-kit', 'build', 'dist', '.vercel'].includes(name)
          && !(name === '.env' || (name.startsWith('.env.') && name !== '.env.example'));
      }
    });
    console.log(`Checking isolated extraction: ${folder}`);
    await verifyProject(target);
  } finally {
    removeTemporary(temporary);
  }
}
