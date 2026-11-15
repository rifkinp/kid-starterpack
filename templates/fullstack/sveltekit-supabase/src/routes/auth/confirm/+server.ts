import { redirect } from '@sveltejs/kit';
import { requireSupabase } from '$lib/server/auth';
import type { RequestHandler } from './$types';

// Token-hash email templates work across browsers without a local PKCE verifier.
export const GET: RequestHandler = async event => {
  const tokenHash = event.url.searchParams.get('token_hash');
  const type = event.url.searchParams.get('type');
  if (!tokenHash || (type !== 'email' && type !== 'signup' && type !== 'recovery')) redirect(303, '/login?error=invalid-confirmation');
  const client = requireSupabase(event);
  const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) redirect(303, '/login?error=confirmation-failed');
  redirect(303, type === 'recovery' ? '/update-password' : '/dashboard');
};
