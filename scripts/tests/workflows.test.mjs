import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { repositoryRoot, discoverTemplates } from '../validate.mjs';

test('all workflows parse as YAML and expose their jobs', () => {
  const directory = path.join(repositoryRoot, '.github/workflows');
  for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.yml'))) {
    const workflow = matter.engines.yaml.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    assert.ok(workflow.name && workflow.on && workflow.jobs, `${file}: invalid workflow structure`);
  }
});

test('repository metadata and discovered CI starters agree', () => {
  const entries = fs.readdirSync(path.join(repositoryRoot, 'content')).filter(file => file.endsWith('.md'))
    .map(file => matter(fs.readFileSync(path.join(repositoryRoot, 'content', file), 'utf8')).data.path).sort();
  assert.deepEqual(discoverTemplates(repositoryRoot), entries);
});
