import { redirect } from '@sveltejs/kit';
import { requireSupabase } from '$lib/server/auth';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async (event) => {
  const code = event.url.searchParams.get('code');
  if (!code) redirect(303, '/login?error=missing-code');
  const client = requireSupabase(event);
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) redirect(303, '/login?error=callback-failed');
  const next = event.url.searchParams.get('next');
  // Never accept arbitrary return URLs (open redirect).
  redirect(303, next === '/update-password' ? '/update-password' : '/dashboard');
};
