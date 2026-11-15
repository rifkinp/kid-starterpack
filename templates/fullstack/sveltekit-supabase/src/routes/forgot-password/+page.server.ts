import { fail } from '@sveltejs/kit';
import { requireSupabase } from '$lib/server/auth';
import type { Actions } from './$types';
export const actions: Actions = {
  default: async (event) => {
    const email = String((await event.request.formData()).get('email') ?? '').trim().toLowerCase();
    if (!email.includes('@')) return fail(400, { message: 'Enter a valid email address.' });
    const client = requireSupabase(event);
    await client.auth.resetPasswordForEmail(email, { redirectTo: `${event.url.origin}/auth/callback?next=/update-password` });
    return { success: 'If the account exists, a reset link has been sent.' };
  }
};
