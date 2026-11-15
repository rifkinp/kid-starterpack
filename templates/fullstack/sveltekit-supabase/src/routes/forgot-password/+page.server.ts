import { fail } from '@sveltejs/kit';
import { requireSupabase } from '$lib/server/auth';
import type { Actions } from './$types';
export const actions: Actions = {
  default: async (event) => {
    const email = String((await event.request.formData()).get('email') ?? '').trim().toLowerCase();
    if (!email.includes('@')) return fail(400, { message: 'Enter a valid email address.' });
    const client = requireSupabase(event);
    const unavailable = () => fail(502, { message: 'Unable to process the reset request. Please try again later.' });
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${event.url.origin}/auth/callback?next=/update-password` });
      if (error) return unavailable();
    } catch {
      return unavailable();
    }
    return { success: 'If the account exists, a reset link has been sent.' };
  }
};
