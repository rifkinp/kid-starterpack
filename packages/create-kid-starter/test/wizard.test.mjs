import test from 'node:test';
import assert from 'node:assert/strict';
import { promptForOptions } from '../src/wizard.mjs';
import { runCLI } from '../src/index.mjs';

const template = { id: 'elysia-api', title: 'Elysia API', description: 'API', path: 'templates/backend/elysia-api' };

for (const [answer, expected] of [['y', true], ['yes', true], ['', false], ['n', false]]) {
  test(`wizard offers Git initialization with opt-in answer ${JSON.stringify(answer)}`, async () => {
    const answers = ['1', 'my-api', answer, 'n'];
    const questions = [];
    let closed = false;
    const result = await promptForOptions([template], {
      input: { isTTY: true }, output: { isTTY: true, write() {} },
      createPrompt: () => ({
        question: async text => { questions.push(text); return answers.shift(); },
        close: () => { closed = true; }
      })
    });
    assert.ok(questions.some(text => text.includes('Initialize Git repository?')));
    assert.equal(result.initializeGit, expected);
    assert.equal(result.install, false);
    assert.equal(closed, true);
  });
}

test('wizard selection reaches project creation', async () => {
  let generated;
  await runCLI([], {
    catalogLoader: async () => [template],
    prompt: async () => ({ template, directory: 'my-api', initializeGit: true, install: false }),
    projectCreator: async options => { generated = options; return '/tmp/my-api'; },
    output: { log() {} }
  });
  assert.equal(generated.initializeGit, true);
});

test('direct copy with implicit folder never prompts or initializes Git', async () => {
  let generated;
  await runCLI(['--template', template.id], {
    catalogLoader: async () => [template],
    prompt: async () => { throw new Error('Direct copy must never prompt'); },
    projectCreator: async options => { generated = options; return '/tmp/elysia-api'; },
    output: { log() {} }
  });
  assert.equal(generated.initializeGit, false);
  assert.equal(generated.directory, template.id);
});
