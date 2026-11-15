import fs from 'node:fs';
import { discoverTemplates, repositoryRoot } from './validate.mjs';

const matrix = JSON.stringify(discoverTemplates(repositoryRoot));
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `templates=${matrix}\n`);
else console.log(matrix);
