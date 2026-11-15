import { betterAuth } from 'better-auth';
import { pool } from './db';

export const auth = process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET
  ? betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      // For production, a verified transactional email sender is required.
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.RESEND_FROM_EMAIL;
      if (!apiKey || !from) {
        if (process.env.NODE_ENV !== 'production') {
          console.info(`[Kid dev only] Reset link for ${user.email}: ${url}`);
          return;
        }
        throw new Error('Reset email transport is not configured');
      }
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ from, to: [user.email], subject: 'Reset your Kid password', text: `Reset your password: ${url}` })
      });
      if (!response.ok) throw new Error('Reset email delivery failed');
    }
  }
})
  : null;
