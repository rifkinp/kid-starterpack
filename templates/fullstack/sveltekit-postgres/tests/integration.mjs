import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { Pool } from 'pg';
import { getMigrations } from 'better-auth/db/migration';

// Refuse ordinary application databases: this suite creates auth tables and test users.
const databaseURL = process.env.KID_TEST_DATABASE_URL;
assert.ok(databaseURL, 'Set KID_TEST_DATABASE_URL to an empty disposable PostgreSQL database');
assert.match(new URL(databaseURL).pathname, /^\/kid_test_[a-z0-9_]+$/i);
process.env.DATABASE_URL = databaseURL;
process.env.BETTER_AUTH_SECRET = randomBytes(32).toString('hex');
process.env.REQUIRE_EMAIL_VERIFICATION = 'true';
delete process.env.RESEND_API_KEY;
delete process.env.RESEND_FROM_EMAIL;
const listener = net.createServer();
listener.listen(0, '127.0.0.1');
await once(listener, 'listening');
const port = listener.address().port;
await new Promise(resolve => listener.close(resolve));
const origin = `http://127.0.0.1:${port}`;
process.env.BETTER_AUTH_URL = origin;
const pool = new Pool({ connectionString: databaseURL });
let server;
let logs = '';

async function api(endpoint, data, cookie = '') {
  return fetch(`${origin}/api/auth/${endpoint}`, {
    method: 'POST', headers: { 'content-type': 'application/json', origin, cookie }, body: JSON.stringify(data),
    signal: AbortSignal.timeout(10_000)
  });
}
function cookies(response) {
  return response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
}
async function dashboard(cookie = '') {
  return fetch(`${origin}/dashboard`, { headers: { cookie }, redirect: 'manual', signal: AbortSignal.timeout(10_000) });
}
async function settings(cookie = '') {
  return fetch(`${origin}/settings`, { headers: { cookie }, redirect: 'manual', signal: AbortSignal.timeout(10_000) });
}
async function emailLink(kind, email) {
  const marker = `${kind} link for ${email}: `;
  for (let attempt = 0; attempt < 25; attempt++) {
    const line = logs.split('\n').find(value => value.includes(marker));
    if (line) return line.split(marker)[1].trim();
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error(`Development ${kind.toLowerCase()} email was not captured`);
}
async function action(name, data, cookie = '') {
  return fetch(`${origin}/dashboard?/${name}`, {
    method: 'POST', headers: { origin, cookie, accept: 'text/html' }, body: new URLSearchParams(data), redirect: 'manual',
    signal: AbortSignal.timeout(10_000)
  });
}
async function ready() {
  for (let attempt = 0; attempt < 150; attempt++) {
    if (server.exitCode !== null) throw new Error('Integration server exited before becoming ready');
    try { if ((await fetch(origin, { signal: AbortSignal.timeout(2000) })).ok) return; } catch { /* Startup is asynchronous. */ }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error('Integration server did not become ready');
}

try {
  const tables = await pool.query("select tablename from pg_tables where schemaname = 'public'");
  assert.equal(tables.rowCount, 0, 'Use an empty disposable database');
  const { auth } = await import('../src/lib/server/auth.ts');
  assert.ok(auth);
  await (await getMigrations(auth.options)).runMigrations();
  await pool.query(await readFile(new URL('../migrations/0001_tasks.sql', import.meta.url), 'utf8'));
  // The migration owns a separate connection pool; close it before starting the app.
  const { pool: migrationPool } = await import('../src/lib/server/db.ts');
  await migrationPool.end();
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: new URL('../', import.meta.url), env: { ...process.env, NODE_ENV: 'development' },
    windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
  });
  server.stdout.on('data', chunk => { logs = (logs + chunk).slice(-32_000); });
  server.stderr.on('data', chunk => { logs = (logs + chunk).slice(-32_000); });
  await ready();
  assert.equal((await dashboard()).status, 303);
  assert.equal((await settings()).status, 303);
  assert.equal((await action('add', { title: 'unauthorized' })).status, 303);
  const password = randomBytes(24).toString('hex');
  const emailA = `kid-a-${randomUUID()}@example.com`;
  const emailB = `kid-b-${randomUUID()}@example.com`;
  const signupA = await api('sign-up/email', { name: 'Test A', email: emailA, password });
  const signupB = await api('sign-up/email', { name: 'Test B', email: emailB, password });
  assert.equal(signupA.status, 200);
  assert.equal(signupB.status, 200);
  assert.equal(cookies(signupA), '', 'Unverified signup must not create a session');
  assert.equal((await api('sign-in/email', { email: emailA, password })).status, 403);
  for (const email of [emailA, emailB]) {
    const response = await fetch(await emailLink('Verification', email), { redirect: 'manual' });
    assert.ok(response.status === 200 || response.status === 302);
  }
  const signinA = await api('sign-in/email', { email: emailA, password });
  const signinB = await api('sign-in/email', { email: emailB, password });
  assert.equal(signinA.status, 200);
  assert.equal(signinB.status, 200);
  let cookieA = cookies(signinA);
  const cookieB = cookies(signinB);
  let passwordA = password;
  const otherA = cookies(await api('sign-in/email', { email: emailA, password }));
  const sessionResponse = await fetch(`${origin}/api/auth/list-sessions`, { headers: { cookie: cookieA } });
  assert.equal(sessionResponse.status, 200);
  const sessions = await sessionResponse.json();
  assert.equal(sessions.length, 2);
  const settingsResponse = await settings(cookieA);
  assert.equal(settingsResponse.status, 200);
  const settingsHTML = await settingsResponse.text();
  for (const session of sessions) assert.ok(!settingsHTML.includes(session.token), 'Settings must not serialize session tokens');
  assert.equal((await api('update-user', { name: 'Updated Test A' }, cookieA)).status, 200);
  assert.ok((await (await settings(cookieA)).text()).includes('Updated Test A'));
  assert.equal((await api('update-user', { name: 'x'.repeat(101) }, cookieA)).status, 400);
  assert.equal((await api('revoke-other-sessions', {}, cookieA)).status, 200);
  assert.equal((await dashboard(otherA)).status, 303);
  assert.equal((await dashboard(cookieA)).status, 200);
  const passwordSession = cookies(await api('sign-in/email', { email: emailA, password }));
  assert.equal((await api('change-password', { currentPassword: 'incorrect-password', newPassword: 'unused-password-123' }, cookieA)).status, 400);
  passwordA = randomBytes(24).toString('hex');
  const passwordChange = await api('change-password', { currentPassword: password, newPassword: passwordA, revokeOtherSessions: true }, cookieA);
  assert.equal(passwordChange.status, 200);
  cookieA = cookies(passwordChange) || cookieA;
  assert.equal((await dashboard(passwordSession)).status, 303);
  const title = `private-${randomUUID()}`;
  assert.equal((await action('add', { title }, cookieA)).status, 200);
  assert.ok((await (await dashboard(cookieA)).text()).includes(title));
  assert.ok(!(await (await dashboard(cookieB)).text()).includes(title));
  const { rows: [task] } = await pool.query('select id, done from tasks where title = $1', [title]);
  assert.ok(task);
  await action('toggle', { id: task.id, done: 'true' }, cookieB);
  assert.equal((await pool.query('select done from tasks where id=$1', [task.id])).rows[0].done, false);
  await action('delete', { id: task.id }, cookieB);
  assert.equal((await pool.query('select id from tasks where id=$1', [task.id])).rowCount, 1);
  await action('toggle', { id: task.id, done: 'true' }, cookieA);
  assert.equal((await pool.query('select done from tasks where id=$1', [task.id])).rows[0].done, true);
  await action('delete', { id: task.id }, cookieA);
  assert.equal((await pool.query('select id from tasks where id=$1', [task.id])).rowCount, 0);
  assert.equal((await api('sign-out', {}, cookieB)).status, 200);
  assert.equal((await dashboard(cookieB)).status, 303);
  const login = await api('sign-in/email', { email: emailB, password });
  assert.equal(login.status, 200);
  assert.equal((await dashboard(cookies(login))).status, 200);
  assert.equal((await api('request-password-reset', { email: emailA, redirectTo: `${origin}/reset-password` })).status, 200);
  const resetLink = await emailLink('Reset', emailA);
  assert.ok(resetLink, 'Expected the development-only reset transport to capture a link');
  const resetRedirect = await fetch(resetLink, { redirect: 'manual', signal: AbortSignal.timeout(10_000) });
  const token = new URL(resetRedirect.headers.get('location'), origin).searchParams.get('token');
  assert.ok(token);
  const newPassword = randomBytes(24).toString('hex');
  assert.equal((await api('reset-password', { token, newPassword })).status, 200);
  assert.ok(!(await api('reset-password', { token, newPassword })).ok, 'Reset tokens must be single-use');
  assert.ok(!(await api('sign-in/email', { email: emailA, password: passwordA })).ok);
  assert.equal((await dashboard(cookieA)).status, 303, 'Password reset must revoke old sessions');
  assert.equal((await api('sign-in/email', { email: emailA, password: newPassword })).status, 200);
  console.log('PostgreSQL HTTP integration passed: verification-required signup, profile validation, settings without session tokens, password change, session revocation, task isolation and reset.');
} finally {
  if (server && server.exitCode === null) {
    const stopped = once(server, 'exit');
    server.kill();
    await stopped;
  }
  await pool.end();
}
