import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

let server;
let action;
before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  const route = await server.ssrLoadModule('/src/routes/forgot-password/+page.server.ts');
  action = route.actions.default;
});
after(async () => { await server?.close(); });

function event(resetPasswordForEmail, email = 'person@example.com') {
  return {
    request: new Request('http://localhost/forgot-password', { method: 'POST', body: new URLSearchParams({ email }) }),
    url: new URL('http://localhost/forgot-password'),
    locals: { supabase: { auth: { resetPasswordForEmail } } }
  };
}

test('provider failure returns a retryable error without claiming email delivery', async () => {
  const result = await action(event(async () => ({ error: { message: 'SMTP internal details' } })));
  assert.equal(result.status, 502);
  assert.equal(result.data.success, undefined);
  assert.match(result.data.message, /try again/i);
  assert.doesNotMatch(result.data.message, /SMTP/);
});

test('transport failure uses the same safe response', async () => {
  const result = await action(event(async () => { throw new Error('private network details'); }));
  assert.equal(result.status, 502);
  assert.doesNotMatch(result.data.message, /private network/);
});

test('successful requests retain a generic account-private message and recovery redirect', async () => {
  let received;
  const result = await action(event(async (...args) => { received = args; return { error: null }; }));
  assert.deepEqual(received, ['person@example.com', { redirectTo: 'http://localhost/auth/callback?next=/update-password' }]);
  assert.match(result.success, /If the account exists/);
});

test('invalid input does not contact the provider', async () => {
  const result = await action(event(() => { throw new Error('must not call provider'); }, 'invalid'));
  assert.equal(result.status, 400);
});
