import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export function requireSupabase(event: RequestEvent) {
  if (!event.locals.supabase) error(503, 'Supabase is not configured. See README.md.');
  return event.locals.supabase;
}
export function readCredentials(data: FormData) {
  const email = String(data.get('email') ?? '').trim().toLowerCase();
  const password = String(data.get('password') ?? '');
  if (!email.includes('@') || password.length < 8 || password.length > 128) return null;
  return { email, password };
}
