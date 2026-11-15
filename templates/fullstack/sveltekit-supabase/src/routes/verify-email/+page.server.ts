import { fail } from '@sveltejs/kit';
import { requireSupabase } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async event => {
    const email = String((await event.request.formData()).get('email') ?? '').trim().toLowerCase();
    if (!email.includes('@') || email.length > 254) return fail(400, { message: 'Enter a valid email address.', success: null });
    const client = requireSupabase(event);
    try {
      const { error } = await client.auth.resend({
        type: 'signup', email, options: { emailRedirectTo: `${event.url.origin}/auth/callback` }
      });
      if (error) return fail(502, { message: 'Unable to request verification. Please try again later.', success: null });
      return { success: 'If this address needs verification, check your inbox for a verification link.', message: null };
    } catch { return fail(502, { message: 'Unable to reach the email service. Please try again.', success: null }); }
  }
};
