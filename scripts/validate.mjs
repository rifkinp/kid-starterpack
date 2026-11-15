import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = ['README.md', 'package.json', '.gitignore'];
const folders = ['templates/frontend/sveltekit-minimal', 'templates/frontend/sveltekit-app', 'templates/backend/elysia-api', 'templates/fullstack/sveltekit-supabase', 'templates/fullstack/sveltekit-postgres'];
let issues = [];
for (const folder of folders) {
  for (const file of required) if (!fs.existsSync(path.join(root, folder, file))) issues.push(`${folder}: missing ${file}`);
  const pkg = JSON.parse(fs.readFileSync(path.join(root, folder, 'package.json'), 'utf8'));
  if (!pkg.scripts?.dev) issues.push(`${folder}: no dev command`);
}
const contentFolder = path.join(root, 'content');
for (const file of fs.readdirSync(contentFolder).filter(x=>x.endsWith('.md'))) {
  const raw = fs.readFileSync(path.join(contentFolder,file),'utf8');
  const templatePath = /^path:\s*(.+)$/m.exec(raw)?.[1]?.trim();
  const slug = /^slug:\s*(.+)$/m.exec(raw)?.[1]?.trim();
  if (!templatePath || !slug) { issues.push(`content/${file}: missing path/slug`); continue; }
  if (slug !== file.slice(0,-3)) issues.push(`content/${file}: slug/filename mismatch`);
  if (!fs.existsSync(path.join(root,templatePath,'package.json'))) issues.push(`content/${file}: bad target ${templatePath}`);
}
// The website's Markdown catalog and the CLI's live registry must agree.
const registry = JSON.parse(fs.readFileSync(path.join(root, 'catalog/templates.json'), 'utf8'));
if (!Array.isArray(registry.templates)) {
  issues.push('catalog/templates.json must define templates[]');
} else {
  const ids = new Set();
  const mdFiles = fs.readdirSync(contentFolder).filter((file) => file.endsWith('.md'));
  for (const item of registry.templates) {
    if (!item.id || ids.has(item.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) {
      issues.push('Duplicate or invalid catalog ID: ' + item.id);
      continue;
    }
    ids.add(item.id);
    const expected = new RegExp('^templates/(frontend|backend|fullstack)/' + item.id + '$');
    if (!expected.test(item.path)) issues.push('Unsafe catalog path: ' + item.path);
    if (!fs.existsSync(path.join(root, item.path, 'package.json'))) issues.push('Missing catalog template: ' + item.path);
    const md = path.join(contentFolder, item.id + '.md');
    if (!fs.existsSync(md)) issues.push('Missing Markdown entry: ' + item.id);
    else {
      const raw = fs.readFileSync(md, 'utf8');
      const mdPath = /^path:\s*(.+)$/m.exec(raw)?.[1]?.trim();
      if (mdPath !== item.path) issues.push('Path mismatch between catalog and content: ' + item.id);
    }
  }
  for (const md of mdFiles) if (!ids.has(md.slice(0, -3))) issues.push('Markdown missing in CLI registry: ' + md);
}

if (issues.length) { console.error(issues.join('\n')); process.exit(1); }
console.log(`Validated ${folders.length} standalone templates and ${fs.readdirSync(contentFolder).filter(x=>x.endsWith('.md')).length} catalog entries.`);
