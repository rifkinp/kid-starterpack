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
if (issues.length) { console.error(issues.join('\n')); process.exit(1); }
console.log(`Validated ${folders.length} standalone templates and ${fs.readdirSync(contentFolder).filter(x=>x.endsWith('.md')).length} catalog entries.`);
