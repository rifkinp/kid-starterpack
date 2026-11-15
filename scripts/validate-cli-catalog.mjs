import fs from 'node:fs';
import path from 'node:path';
import { validateCatalog } from '../packages/create-kid-starter/src/index.mjs';

export function validateCLICatalog(root, markdown) {
  const issues = [];
  const catalogs = [];
  for (const file of ['catalog/templates.json', 'packages/create-kid-starter/catalog.json']) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
      if (raw.version !== 1) throw new Error('Unsupported catalog version');
      const entries = validateCatalog(raw).sort((a, b) => a.id.localeCompare(b.id));
      catalogs.push(entries);
      for (const entry of entries) {
        const metadata = markdown.find(item => item.slug === entry.id);
        if (!metadata || metadata.path !== entry.path || metadata.category !== entry.category
          || metadata.title !== entry.title || metadata.description !== entry.description) {
          issues.push(`${file}: Markdown mismatch for ${entry.id}`);
        }
      }
      for (const metadata of markdown) {
        if (!entries.some(item => item.id === metadata.slug)) issues.push(`${file}: missing ${metadata.slug}`);
      }
    } catch (error) {
      issues.push(`${file}: ${error.message}`);
    }
  }
  if (catalogs.length === 2 && JSON.stringify(catalogs[0]) !== JSON.stringify(catalogs[1])) {
    issues.push('Live and bundled CLI catalogs must agree');
  }
  return issues;
}
