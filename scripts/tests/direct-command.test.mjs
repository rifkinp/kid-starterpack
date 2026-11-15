import { test } from 'node:test';
import assert from 'node:assert/strict';
import { directCopyCommand } from '../../website/src/lib/cli-command.js';
import { parseArgs, runCLI } from '../../packages/create-kid-starter/src/index.mjs';

for (const initializeGit of [false, true]) {
  test(`website direct command runs without prompts, Git selected: ${initializeGit}`, async () => {
    const command = directCopyCommand('elysia-api', initializeGit);
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
    assert.equal(generated.directory, 'my-app');
    assert.equal(generated.install, false);
  });
}
