import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { downloadTemplate } from 'giget';
import { discoverTemplates, repositoryRoot } from './validate.mjs';
import { verifyProject } from './project-checks.mjs';
import { createTemporary, removeTemporary } from './temporary.mjs';

const ref = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repositoryRoot, encoding: 'utf8', windowsHide: true }).trim();
assert.match(ref, /^[a-f0-9]{40}$/);
for (const folder of discoverTemplates(repositoryRoot)) {
  const temporary = createTemporary('kid-giget-');
  try {
    const target = path.join(temporary, 'my-app');
    await downloadTemplate(`gh:rifkinp/kid-starterpack/${folder}#${ref}`, { dir: target });
    const expected = JSON.parse(fs.readFileSync(path.join(repositoryRoot, folder, 'package.json'), 'utf8'));
    const actual = JSON.parse(fs.readFileSync(path.join(target, 'package.json'), 'utf8'));
    assert.equal(actual.name, expected.name);
    for (const excluded of ['.git', 'website', 'content', 'templates']) assert.ok(!fs.existsSync(path.join(target, excluded)));
    if (!process.argv.includes('--transport-only')) await verifyProject(target);
    console.log(`Giget extraction passed: ${folder}#${ref}`);
  } finally {
    removeTemporary(temporary);
  }
}
