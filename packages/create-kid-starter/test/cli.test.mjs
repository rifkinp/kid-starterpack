import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  createProject, exec, parseArgs, resolveDestination, runCLI, validateCatalog
} from '../src/index.mjs';

const api = {
  id: 'elysia-api', title: 'Elysia API', description: 'Bun API',
  category: 'Backend', path: 'templates/backend/elysia-api'
};
const catalog = [api];

test('parses template flags and direct-copy directory', () => {
  const flags = parseArgs(['--template', 'elysia-api', 'my-api', '--no-install']);
  assert.equal(flags.template, 'elysia-api');
  assert.equal(flags.directory, 'my-api');
  assert.equal(flags.install, false);
  assert.equal(parseArgs(['-t', 'elysia-api', '--install']).install, true);
  assert.equal(parseArgs(['-t', 'elysia-api', '--git']).initializeGit, true);
  assert.equal(parseArgs(['-t', 'elysia-api', '--git', '--no-git']).initializeGit, false);
  assert.throws(() => parseArgs(['--package-manager', 'unknown']), /Package manager/);
  assert.throws(() => parseArgs(['--template', '../unsafe']), /Invalid template/);
});

test('direct template mode never invokes the wizard', async () => {
  let generated;
  const output = { log() {} };
  await runCLI(['--template', 'elysia-api', 'my-api'], {
    catalogLoader: async () => catalog,
    prompt: async () => { throw new Error('Wizard should NOT be invoked'); },
    projectCreator: async (options) => {
      generated = options;
      return '/tmp/my-api';
    },
    output
  });
  assert.equal(generated.template.id, 'elysia-api');
  assert.equal(generated.directory, 'my-api');
  assert.equal(generated.install, false);
  assert.equal(generated.initializeGit, false);
});

test('template flag supplies a default directory without prompting', async () => {
  let generated;
  await runCLI(['-t', 'elysia-api'], {
    catalogLoader: async () => catalog,
    prompt: async () => { throw new Error('Wizard should NOT be invoked'); },
    projectCreator: async (options) => {
      generated = options;
      return '/tmp/elysia-api';
    },
    output: { log() {} }
  });
  assert.equal(generated.directory, 'elysia-api');
});

test('rejects unknown template and unsafe manifest paths', async () => {
  await assert.rejects(
    runCLI(['--template', 'unknown-template'], {
      catalogLoader: async () => catalog,
      prompt: async () => { throw new Error('unexpected prompt'); },
      output: { log() {} }
    }),
    /Unknown template/
  );
  assert.throws(() => validateCatalog({
    templates: [{ ...api, path: 'templates/backend/../../private' }]
  }), /Invalid template path/);
});

test('rejects directory traversal and writes outside cwd', () => {
  assert.throws(() => resolveDestination('/tmp/project', '.'), /child directory/);
  assert.throws(() => resolveDestination('/tmp/project', '../parent'), /inside the working directory/);
});

test('clones only selected template contents and renames package', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kid-cli-test-'));
  try {
    const origin = join(root, 'origin');
    const work = join(root, 'work');
    const source = join(origin, 'templates/backend/elysia-api');
    await mkdir(source, { recursive: true });
    await mkdir(join(origin, 'templates/frontend/other'), { recursive: true });
    await mkdir(work);
    await writeFile(join(source, 'package.json'), '{"name":"template-api","scripts":{"dev":"bun run src/index.ts"}}');
    await writeFile(join(source, 'hello.txt'), 'expected template content');
    await writeFile(join(origin, 'templates/frontend/other', 'private.txt'), 'should not appear');
    await exec('git', ['init', '--initial-branch=main', origin]);
    await exec('git', ['-C', origin, 'add', '.']);
    await exec('git', ['-C', origin, '-c', 'user.email=test@example.com',
      '-c', 'user.name=Kid Starter CI', 'commit', '-m', 'fixture']);

    const destination = await createProject({
      template: api, directory: 'my-api', cwd: work,
      repository: pathToFileURL(origin).href, ref: 'main'
    });

    assert.equal(await readFile(join(destination, 'hello.txt'), 'utf8'), 'expected template content');
    assert.equal(JSON.parse(await readFile(join(destination, 'package.json'), 'utf8')).name, 'my-api');
    await assert.rejects(readFile(join(destination, '.git/config')), { code: 'ENOENT' });
    await assert.rejects(readFile(join(destination, 'private.txt')), { code: 'ENOENT' });

    const gitDestination = await createProject({
      template: api, directory: 'my-git-api', cwd: work, initializeGit: true,
      repository: pathToFileURL(origin).href, ref: 'main'
    });
    assert.equal(await readFile(join(gitDestination, '.git/HEAD'), 'utf8'), 'ref: refs/heads/main\n');
    assert.doesNotMatch(await readFile(join(gitDestination, '.git/config'), 'utf8'), /\[remote /);
    await assert.rejects(readFile(join(gitDestination, '.git/logs/HEAD')), { code: 'ENOENT' });

    await assert.rejects(createProject({
      template: api, directory: 'my-api', cwd: work,
      repository: pathToFileURL(origin).href
    }), /Destination already exists/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
