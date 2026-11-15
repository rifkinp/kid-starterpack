import { fail } from '@sveltejs/kit';
import { readCredentials, requireSupabase } from '$lib/server/auth';
import type { Actions } from './$types';
export const actions: Actions = {
  default: async (event) => {
    const credentials = readCredentials(await event.request.formData());
    if (!credentials) return fail(400, { message: 'Provide a valid email and password (at least 8 characters).' });
    const client = requireSupabase(event);
    const { error } = await client.auth.signUp({ ...credentials, options: { emailRedirectTo: `${event.url.origin}/auth/callback` } });
    if (error) return fail(400, { message: 'Could not create the account. Review your credentials.' });
    return { success: 'Check your email for a confirmation link, then sign in. If confirmations are disabled, you can sign in now.' };
  }
};
