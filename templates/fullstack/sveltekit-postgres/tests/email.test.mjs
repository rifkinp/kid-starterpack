import { createServer as createHttpServer } from 'node:http';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

let server;
let sendAccountEmail;
const saved = Object.fromEntries(['NODE_ENV', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL'].map(key => [key, process.env[key]]));
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: { server: createHttpServer() } }, appType: 'custom' });
  ({ sendAccountEmail } = await server.ssrLoadModule('/src/lib/server/email.ts'));
});
after(async () => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  await server?.close();
});

test('production email configuration fails closed and never logs links', async t => {
  process.env.NODE_ENV = 'production';
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM_EMAIL;
  const log = t.mock.method(console, 'info', () => {});
  for (const kind of ['Reset', 'Verification']) {
    await assert.rejects(sendAccountEmail({ to: 'test@example.com', url: 'https://example.com/test-only', kind }), /not configured/);
  }
  assert.equal(log.mock.callCount(), 0);
});

test('development transport captures verification links without contacting an email provider', async t => {
  process.env.NODE_ENV = 'development';
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM_EMAIL;
  const log = t.mock.method(console, 'info', () => {});
  const request = t.mock.method(globalThis, 'fetch', () => { throw new Error('Should not contact provider'); });
  await sendAccountEmail({ to: 'test@example.com', url: 'http://localhost/test-only', kind: 'Verification' });
  assert.equal(log.mock.callCount(), 1);
  assert.equal(request.mock.callCount(), 0);
});

test('provider failures are reported without logging delivery links', async t => {
  process.env.NODE_ENV = 'production';
  process.env.RESEND_API_KEY = 'synthetic-test-key';
  process.env.RESEND_FROM_EMAIL = 'test@example.com';
  const log = t.mock.method(console, 'info', () => {});
  t.mock.method(globalThis, 'fetch', async () => new Response('private provider details', { status: 503 }));
  await assert.rejects(sendAccountEmail({ to: 'test@example.com', url: 'https://example.com/test-only', kind: 'Reset' }), /delivery failed/);
  assert.equal(log.mock.callCount(), 0);
});
