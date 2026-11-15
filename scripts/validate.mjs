import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { gigetCommand, readMetadata } from '../website/src/lib/catalog-metadata.js';
import { validateCLICatalog } from './validate-cli-catalog.mjs';

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

export function discoverTemplates(root) {
  return ['frontend', 'backend', 'fullstack'].flatMap(category => {
    const directory = path.join(root, 'templates', category);
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => `templates/${category}/${entry.name}`);
  }).sort();
}

export function validateRepository(root = repositoryRoot) {
  const issues = [];
  const folders = discoverTemplates(root);
  const entries = [];
  const seenSlugs = new Set();
  const seenPaths = new Set();
  if (!folders.length) issues.push('No starter folders found');
  for (const folder of folders) {
    for (const file of ['README.md', 'package.json', '.gitignore', 'LICENSE', 'bun.lock']) {
      if (!fs.existsSync(path.join(root, folder, file))) issues.push(`${folder}: missing ${file}`);
    }
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(root, folder, 'package.json'), 'utf8'));
      for (const command of ['dev', 'check']) {
        if (!pkg.scripts?.[command]) issues.push(`${folder}: missing ${command} script`);
      }
      if (!pkg.scripts?.build && !pkg.scripts?.test) issues.push(`${folder}: missing build/test script`);
      if (pkg.packageManager !== 'bun@1.4.4') issues.push(`${folder}: packageManager must be bun@1.4.4`);
    } catch (error) {
      issues.push(`${folder}: ${error.message}`);
    }
  }
  const content = path.join(root, 'content');
  const files = fs.existsSync(content) ? fs.readdirSync(content).filter(file => file.endsWith('.md')) : [];
  if (!files.length) issues.push('No catalog entries found');
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(content, file), 'utf8');
      if (!/^---\r?\n/.test(raw)) throw new Error('Missing YAML frontmatter');
      const metadata = readMetadata(matter(raw).data);
      if (seenSlugs.has(metadata.slug)) issues.push(`${file}: duplicate slug ${metadata.slug}`);
      if (seenPaths.has(metadata.path)) issues.push(`${file}: duplicate target ${metadata.path}`);
      seenSlugs.add(metadata.slug);
      seenPaths.add(metadata.path);
      if (metadata.slug !== file.slice(0, -3)) issues.push(`${file}: slug/filename mismatch`);
      if (!folders.includes(metadata.path)) issues.push(`${file}: missing starter ${metadata.path}`);
      gigetCommand(metadata, 'rifkinp');
      entries.push(metadata);
    } catch (error) {
      issues.push(`${file}: ${error.message}`);
    }
  }
  for (const folder of folders) {
    if (!seenPaths.has(folder)) issues.push(`${folder}: missing catalog entry`);
  }
  issues.push(...validateCLICatalog(root, entries));
  return { issues, folders, entries };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validateRepository();
  if (result.issues.length) {
    console.error(result.issues.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`Validated ${result.folders.length} standalone templates and ${result.entries.length} catalog entries.`);
  }
}
