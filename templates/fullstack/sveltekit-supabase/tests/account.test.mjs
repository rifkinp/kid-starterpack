import { createServer as createHttpServer } from 'node:http';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

let server;
let settings;
let callback;
let verification;
let confirmation;
const user = { id: 'owner-a', email: 'owner@example.com', email_confirmed_at: '2026-01-01', user_metadata: { display_name: 'Owner' } };
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: { server: createHttpServer() } }, appType: 'custom' });
  settings = await server.ssrLoadModule('/src/routes/(protected)/settings/+page.server.ts');
  callback = await server.ssrLoadModule('/src/routes/auth/callback/+server.ts');
  verification = await server.ssrLoadModule('/src/routes/verify-email/+page.server.ts');
  confirmation = await server.ssrLoadModule('/src/routes/auth/confirm/+server.ts');
});
after(async () => { await server?.close(); });

function event(auth = {}, data = {}, url = 'http://localhost/settings') {
  return {
    url: new URL(url), request: new Request(url, { method: 'POST', body: new URLSearchParams(data) }),
    locals: { supabase: { auth: { getUser: async () => ({ data: { user }, error: null }), ...auth } } }
  };
}

test('settings load returns display-only metadata without session secrets', async () => {
  assert.deepEqual(await settings.load(event()), { profile: { email: user.email, displayName: 'Owner', emailVerified: true } });
});

test('every settings mutation independently denies unauthenticated requests', async () => {
  for (const action of Object.values(settings.actions)) {
    await assert.rejects(() => action(event({ getUser: async () => ({ data: { user: null }, error: null }) })), { status: 303, location: '/login' });
  }
  await assert.rejects(() => settings.load(event({ getUser: async () => ({ data: { user }, error: new Error('invalid token') }) })), { status: 303 });
});

test('profile updates only display name, ignoring submitted ownership and roles', async () => {
  let update;
  const result = await settings.actions.profile(event({ updateUser: async value => { update = value; return { error: null }; } }, {
    name: ' Updated name ', user_id: 'other-owner', email: 'other@example.com', role: 'admin'
  }));
  assert.equal(result.success, 'Profile saved.');
  assert.deepEqual(update, { data: { display_name: 'Updated name' } });
});

test('profile validation rejects empty and oversized names before provider updates', async () => {
  for (const name of [' ', 'x'.repeat(101)]) {
    const result = await settings.actions.profile(event({ updateUser: () => { throw new Error('Must not call'); } }, { name }));
    assert.equal(result.status, 400);
  }
});

test('settings reset email always targets the verified session identity', async () => {
  let target;
  const result = await settings.actions.password(event({ resetPasswordForEmail: async (...args) => { target = args; return { error: null }; } }, { email: 'attacker@example.com' }));
  assert.deepEqual(target, [user.email, { redirectTo: 'http://localhost/auth/callback?next=/update-password' }]);
  assert.ok(result.success);
});

test('other-device signout preserves the current session scope', async () => {
  let scope;
  const result = await settings.actions.sessions(event({ signOut: async value => { scope = value; return { error: null }; } }));
  assert.deepEqual(scope, { scope: 'others' });
  assert.match(result.success, /refreshes/);
});

test('provider failures never become success or expose private details', async () => {
  for (const [name, method, data] of [['profile', 'updateUser', { name: 'Owner' }], ['password', 'resetPasswordForEmail', {}], ['sessions', 'signOut', {}]]) {
    const result = await settings.actions[name](event({ [method]: async () => ({ error: { message: 'private provider detail' } }) }, data));
    assert.ok(result.status >= 400);
    assert.equal(result.data.success, null);
    assert.doesNotMatch(result.data.message, /private provider/);
  }
});

test('resend confirmation uses signup and an allowlisted local callback', async () => {
  let request;
  const result = await verification.actions.default(event({ resend: async value => { request = value; return { error: null }; } }, { email: 'Person@Example.com' }));
  assert.deepEqual(request, { type: 'signup', email: 'person@example.com', options: { emailRedirectTo: 'http://localhost/auth/callback' } });
  assert.match(result.success, /If this address/);
});

test('verification callback cannot redirect to an attacker-controlled URL', async () => {
  for (const next of ['https://attacker.example', '//attacker.example', '/settings']) {
    await assert.rejects(() => callback.GET(event({ exchangeCodeForSession: async () => ({ error: null }) }, {}, `http://localhost/auth/callback?code=test&next=${encodeURIComponent(next)}`)), { status: 303, location: '/dashboard' });
  }
  await assert.rejects(() => callback.GET(event({ exchangeCodeForSession: async () => ({ error: null }) }, {}, 'http://localhost/auth/callback?code=test&next=/update-password')), { status: 303, location: '/update-password' });
});

test('verification callback fails closed for missing or invalid exchange codes', async () => {
  await assert.rejects(() => callback.GET(event({}, {}, 'http://localhost/auth/callback')), { status: 303, location: '/login?error=missing-code' });
  await assert.rejects(() => callback.GET(event({ exchangeCodeForSession: async () => ({ error: new Error('Invalid code') }) }, {}, 'http://localhost/auth/callback?code=invalid')), { status: 303, location: '/login?error=callback-failed' });
});

test('token-hash confirmation validates signup/recovery without a local code verifier', async () => {
  for (const [type, location] of [['email', '/dashboard'], ['signup', '/dashboard'], ['recovery', '/update-password']]) {
    let received;
    await assert.rejects(() => confirmation.GET(event({ verifyOtp: async value => { received = value; return { error: null }; } }, {}, `http://localhost/auth/confirm?type=${type}&token_hash=synthetic-hash&next=https://attacker.example`)), { status: 303, location });
    assert.deepEqual(received, { token_hash: 'synthetic-hash', type });
  }
});

test('token-hash confirmation rejects missing, unsupported and expired credentials', async () => {
  for (const query of ['type=signup', 'type=magiclink&token_hash=test', 'type=email_change&token_hash=test']) {
    await assert.rejects(() => confirmation.GET(event({}, {}, `http://localhost/auth/confirm?${query}`)), { status: 303, location: '/login?error=invalid-confirmation' });
  }
  await assert.rejects(() => confirmation.GET(event({ verifyOtp: async () => ({ error: new Error('Expired') }) }, {}, 'http://localhost/auth/confirm?type=signup&token_hash=expired')), { status: 303, location: '/login?error=confirmation-failed' });
});
