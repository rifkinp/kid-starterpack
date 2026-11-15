import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { readMetadata } from '../website/src/lib/catalog-metadata.js';
import { repositoryRoot } from './validate.mjs';

const content = path.join(repositoryRoot, 'content');
const templates = fs.readdirSync(content).filter(file => file.endsWith('.md')).map(file => {
  const metadata = readMetadata(matter(fs.readFileSync(path.join(content, file), 'utf8')).data);
  return {
    id: metadata.slug, title: metadata.title, description: metadata.description,
    path: metadata.path, category: metadata.category
  };
}).sort((a, b) => a.id.localeCompare(b.id));
const json = JSON.stringify({ version: 1, templates }, null, 2) + '\n';
for (const file of ['catalog/templates.json', 'packages/create-kid-starter/catalog.json']) {
  fs.writeFileSync(path.join(repositoryRoot, file), json);
}
console.log(`Generated live and bundled CLI catalogs from ${templates.length} Markdown entries.`);
