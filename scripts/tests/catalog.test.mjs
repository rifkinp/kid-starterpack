import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateRepository } from '../validate.mjs';
import { readMetadata, gigetCommand } from '../../website/src/lib/catalog-metadata.js';
import { createTemporary, removeTemporary } from '../temporary.mjs';

const metadata = {
  slug: 'sample', title: 'Sample', category: 'Frontend', level: 'minimal', stack: 'SvelteKit',
  description: 'A standalone starter', path: 'templates/frontend/sample', tags: ['Svelte'], featured: false
};

test('metadata preserves types and generates the expected Giget command', () => {
  assert.deepEqual(readMetadata(metadata), metadata);
  assert.equal(gigetCommand(metadata, 'rifkinp'), 'npx giget@latest gh:rifkinp/kid-starterpack/templates/frontend/sample my-app');
  assert.throws(() => gigetCommand(metadata, 'owner; echo bad'));
});

for (const field of Object.keys(metadata)) {
  test(`missing ${field} is rejected`, () => {
    const value = { ...metadata };
    delete value[field];
    assert.throws(() => readMetadata(value));
  });
}

for (const value of [
  { featured: 'false' }, { tags: 'Svelte' }, { tags: [1] }, { level: 'production' },
  { category: 'Backend' }, { path: '../outside' }, { slug: 'other' }, { path: 'templates/frontend/../sample' }
]) {
  test(`invalid metadata is rejected: ${JSON.stringify(value)}`, () => {
    assert.throws(() => readMetadata({ ...metadata, ...value }));
  });
}

test('validator discovers starters and rejects orphans, duplicates and malformed manifests', t => {
  const root = createTemporary('kid-catalog-');
  t.after(() => removeTemporary(root));
  const folder = path.join(root, metadata.path);
  fs.mkdirSync(folder, { recursive: true });
  fs.mkdirSync(path.join(root, 'content'));
  const registry = JSON.stringify({ version: 1, templates: [{
    id: metadata.slug, title: metadata.title, description: metadata.description,
    path: metadata.path, category: metadata.category
  }] });
  for (const file of ['catalog/templates.json', 'packages/create-kid-starter/catalog.json']) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), registry);
  }
  for (const file of ['README.md', '.gitignore', 'LICENSE', 'bun.lock']) fs.writeFileSync(path.join(folder, file), 'fixture');
  fs.writeFileSync(path.join(folder, 'package.json'), JSON.stringify({ packageManager: 'bun@1.4.4', scripts: { dev: 'vite', check: 'check', build: 'build' } }));
  const markdown = `---\n${Object.entries(metadata).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')}\n---\nHello`;
  fs.writeFileSync(path.join(root, 'content/sample.md'), markdown);
  assert.deepEqual(validateRepository(root).issues, []);
  const bundled = path.join(root, 'packages/create-kid-starter/catalog.json');
  fs.writeFileSync(bundled, registry.replace(metadata.description, 'stale description'));
  assert.match(validateRepository(root).issues.join('\n'), /Markdown mismatch/);
  assert.match(validateRepository(root).issues.join('\n'), /catalogs must agree/);
  fs.writeFileSync(bundled, registry);
  fs.writeFileSync(path.join(root, 'content/copy.md'), markdown);
  assert.match(validateRepository(root).issues.join('\n'), /duplicate slug/);
  assert.match(validateRepository(root).issues.join('\n'), /duplicate target/);
  fs.unlinkSync(path.join(root, 'content/copy.md'));
  fs.unlinkSync(path.join(root, 'content/sample.md'));
  assert.match(validateRepository(root).issues.join('\n'), /missing catalog entry/);
  fs.writeFileSync(path.join(folder, 'package.json'), '{broken');
  assert.ok(validateRepository(root).issues.some(issue => issue.includes('JSON')));
});
