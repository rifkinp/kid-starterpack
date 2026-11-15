import { test } from 'node:test';
import assert from 'node:assert/strict';
import { directCopyCommand, projectNameError } from '../../website/src/lib/cli-command.js';
import { parseArgs, runCLI } from '../../packages/create-kid-starter/src/index.mjs';

for (const initializeGit of [false, true]) {
  for (const install of [false, true]) {
  test(`website direct command runs without prompts, Git: ${initializeGit}, install: ${install}`, async () => {
    const command = directCopyCommand('elysia-api', { directory: 'my-project-2', initializeGit, install });
    const args = command.split(' ').slice(3);
    assert.equal(parseArgs(args).template, 'elysia-api');
    let generated;
    await runCLI(args, {
      catalogLoader: async () => [{ id: 'elysia-api' }],
      prompt: () => { throw new Error('A copied website command must never prompt'); },
      projectCreator: async options => { generated = options; return '/tmp/my-app'; },
      output: { log() {} }
    });
    assert.equal(generated.initializeGit, initializeGit);
    assert.equal(generated.directory, 'my-project-2');
    assert.equal(generated.install, install);
    assert.equal(generated.packageManager, 'bun');
  });
  }
}

test('default copy command retains the default name without installing or initializing Git', () => {
  assert.equal(directCopyCommand('elysia-api'), 'npx --yes create-kid-starter@latest --template elysia-api my-app');
});

for (const directory of ['', 'MyApp', 'my app', '../escape', '--install', 'my-app;whoami', 'my-app$(whoami)', 'my--app', 'my-app-', 'con', 'com1', 'a'.repeat(215)]) {
  test(`rejects unsafe or nonstandard project name: ${directory.slice(0, 30)}`, () => {
    assert.ok(projectNameError(directory));
    assert.throws(() => directCopyCommand('elysia-api', { directory }));
  });
}
