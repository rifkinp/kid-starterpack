import { fail, redirect } from '@sveltejs/kit';
import { requireSupabase } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => {
  const client = requireSupabase(event);
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect(303, '/login');
};
export const actions: Actions = { default: async (event) => {
  const password = String((await event.request.formData()).get('password') ?? '');
  if (password.length < 8 || password.length > 128) return fail(400, { message: 'Password must be between 8 and 128 characters.' });
  const client = requireSupabase(event);
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect(303, '/login');
  const { error } = await client.auth.updateUser({ password });
  if (error) return fail(400, { message: 'Unable to update password.' });
  redirect(303, '/dashboard');
}};
