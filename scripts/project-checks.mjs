import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import assert from 'node:assert/strict';

const bun = process.platform === 'win32' ? 'bun.exe' : 'bun';

function cleanEnvironment() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (/^(DATABASE_URL|BETTER_AUTH_|PUBLIC_SUPABASE_|RESEND_|KID_TEST_)/.test(key)) delete env[key];
  }
  return env;
}

export function run(args, cwd) {
  const result = spawnSync(bun, args, { cwd, env: cleanEnvironment(), stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`bun ${args.join(' ')} failed (${result.status})`);
}

async function availablePort() {
  const server = net.createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return address.port;
}

async function smoke(directory, svelte) {
  const port = await availablePort();
  const args = svelte
    ? ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort']
    : ['src/index.ts'];
  const child = spawn(bun, args, {
    cwd: directory, env: { ...cleanEnvironment(), PORT: String(port) }, windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', chunk => { output = (output + chunk).slice(-8000); });
  child.stderr.on('data', chunk => { output = (output + chunk).slice(-8000); });
  let launchError;
  child.on('error', error => { launchError = error; });
  try {
    const url = `http://127.0.0.1:${port}${svelte ? '/' : '/health'}`;
    let response;
    const deadline = Date.now() + 45_000;
    while (Date.now() < deadline) {
      if (launchError) throw launchError;
      if (child.exitCode !== null) throw new Error(`Server exited: ${output}`);
      try {
        response = await fetch(url, { signal: AbortSignal.timeout(2000) });
        break;
      } catch { await new Promise(resolve => setTimeout(resolve, 200)); }
    }
    assert.ok(response, `Server did not become ready: ${output}`);
    assert.equal(response.status, 200, `Welcome/health failed: ${await response.text()}\n${output}`);
    const missing = await fetch(`http://127.0.0.1:${port}/does-not-exist`, { signal: AbortSignal.timeout(5000) });
    assert.equal(missing.status, 404);
    console.log('HTTP welcome/health and 404 checks passed');
  } finally {
    if (child.exitCode === null) {
      const stopped = once(child, 'exit');
      child.kill();
      await stopped;
    }
  }
}

export async function verifyProject(directory) {
  const pkg = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
  run(['install', '--frozen-lockfile'], directory);
  run(['run', 'check'], directory);
  if (pkg.scripts.test) run(['run', 'test'], directory);
  if (pkg.scripts.build) run(['run', 'build'], directory);
  await smoke(directory, Boolean(pkg.scripts.build));
}
