import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { pool } from './db';
import { sendAccountEmail } from './email';

function normalizeName(value: string) {
  const name = value.trim();
  if (!name || name.length > 100) throw new APIError('BAD_REQUEST', { message: 'Name must be 1–100 characters.' });
  return name;
}

export const auth = process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET
  ? betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  databaseHooks: {
    user: {
      create: { before: async user => ({ data: { ...user, name: normalizeName(user.name) } }) },
      update: { before: async user => user.name === undefined ? undefined : ({ data: { ...user, name: normalizeName(user.name) } }) }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: ({ user, url }) => sendAccountEmail({ to: user.email, url, kind: 'Verification' })
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION !== 'false',
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: ({ user, url }) => sendAccountEmail({ to: user.email, url, kind: 'Reset' })
  }
})
  : null;
