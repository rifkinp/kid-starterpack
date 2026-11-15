import { fail, redirect } from '@sveltejs/kit';
import { readCredentials, requireSupabase } from '$lib/server/auth';
import type { Actions } from './$types';
export const actions: Actions = {
  default: async (event) => {
    const credentials = readCredentials(await event.request.formData());
    if (!credentials) return fail(400, { message: 'Provide a valid email and password (at least 8 characters).' });
    const client = requireSupabase(event);
    const { error } = await client.auth.signInWithPassword(credentials);
    if (error) return fail(400, { message: 'Invalid credentials or the account is not confirmed.' });
    redirect(303, '/dashboard');
  }
};
