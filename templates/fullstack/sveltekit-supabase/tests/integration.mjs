import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// Explicitly opt into a disposable project. The admin credential never reaches app code.
assert.equal(process.env.KID_TEST_SUPABASE_DISPOSABLE, 'yes', 'Use a disposable Supabase project and set KID_TEST_SUPABASE_DISPOSABLE=yes');
const url = process.env.KID_TEST_SUPABASE_URL;
const key = process.env.KID_TEST_SUPABASE_PUBLISHABLE_KEY;
const adminKey = process.env.KID_TEST_SUPABASE_ADMIN_KEY;
assert.ok(url && key && adminKey, 'Missing disposable Supabase test credentials');
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, adminKey, options);
const clientA = createClient(url, key, options);
const clientB = createClient(url, key, options);
const anonymous = createClient(url, key, options);
const users = [];
const password = randomBytes(24).toString('hex');
const emailA = `kid-test-a-${randomUUID()}@example.com`;
const emailB = `kid-test-b-${randomUUID()}@example.com`;
const cleanupErrors = [];

async function createUser(email) {
  const result = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  assert.equal(result.error, null, 'Disposable test user creation failed');
  assert.ok(result.data.user);
  users.push(result.data.user.id);
  return result.data.user;
}

try {
  const userA = await createUser(emailA);
  const userB = await createUser(emailB);
  assert.equal((await clientA.auth.signInWithPassword({ email: emailA, password })).error, null);
  assert.equal((await clientB.auth.signInWithPassword({ email: emailB, password })).error, null);
  const inserted = await clientA.from('notes').insert({ user_id: userA.id, title: `private-${randomUUID()}` }).select('id,title').single();
  assert.equal(inserted.error, null, 'Apply supabase/migrations/0001_notes.sql to the disposable project first');
  const note = inserted.data;
  assert.ok(note);
  assert.equal((await clientA.from('notes').select('id').eq('id', note.id)).data?.length, 1);
  const foreignRead = await clientB.from('notes').select('id').eq('id', note.id);
  assert.equal(foreignRead.error, null);
  assert.deepEqual(foreignRead.data, []);
  const publicRead = await anonymous.from('notes').select('id').eq('id', note.id);
  assert.ok(publicRead.error || publicRead.data?.length === 0);
  const foreignUpdate = await clientB.from('notes').update({ title: 'forbidden' }).eq('id', note.id).select('id');
  assert.equal(foreignUpdate.error, null);
  assert.deepEqual(foreignUpdate.data, []);
  const foreignDelete = await clientB.from('notes').delete().eq('id', note.id).select('id');
  assert.equal(foreignDelete.error, null);
  assert.deepEqual(foreignDelete.data, []);
  assert.ok((await clientB.from('notes').insert({ user_id: userA.id, title: 'forged owner' })).error);
  assert.ok((await clientA.from('notes').update({ user_id: userB.id }).eq('id', note.id)).error);
  const ownedUpdate = await clientA.from('notes').update({ title: 'updated by owner' }).eq('id', note.id).select('title').single();
  assert.equal(ownedUpdate.error, null);
  assert.equal(ownedUpdate.data?.title, 'updated by owner');
  const ownedDelete = await clientA.from('notes').delete().eq('id', note.id).select('id');
  assert.equal(ownedDelete.error, null);
  assert.equal(ownedDelete.data?.length, 1);
  // Exercise provider recovery tokens without assuming an SMTP service or reading a real inbox.
  const recovery = await admin.auth.admin.generateLink({ type: 'recovery', email: emailA });
  assert.equal(recovery.error, null);
  const recovered = createClient(url, key, options);
  assert.equal((await recovered.auth.verifyOtp({ type: 'recovery', token_hash: recovery.data.properties.hashed_token })).error, null);
  const newPassword = randomBytes(24).toString('hex');
  assert.equal((await recovered.auth.updateUser({ password: newPassword })).error, null);
  const fresh = createClient(url, key, options);
  assert.ok((await fresh.auth.signInWithPassword({ email: emailA, password })).error);
  assert.equal((await fresh.auth.signInWithPassword({ email: emailA, password: newPassword })).error, null);
  assert.equal((await fresh.auth.signOut()).error, null);
  assert.ok((await fresh.auth.getUser()).error);
  console.log('Supabase provider integration passed: two-user RLS CRUD, forged ownership denial, recovery tokens and sign-out. SMTP, confirmation email links and browser PKCE remain separate checks.');
} finally {
  for (const id of users) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) cleanupErrors.push(id);
  }
}
assert.equal(cleanupErrors.length, 0, 'Disposable test user cleanup failed; review the test project');
