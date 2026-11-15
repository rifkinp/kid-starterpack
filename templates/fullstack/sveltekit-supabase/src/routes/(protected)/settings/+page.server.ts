import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { requireSupabase } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

async function account(event: RequestEvent) {
  const client = requireSupabase(event);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect(303, '/login');
  return { client, user };
}

export const load: PageServerLoad = async event => {
  const { user } = await account(event);
  const displayName: unknown = user.user_metadata?.display_name;
  return {
    profile: {
      email: user.email ?? '', displayName: typeof displayName === 'string' ? displayName : '',
      emailVerified: !!user.email_confirmed_at
    }
  };
};

export const actions: Actions = {
  profile: async event => {
    const { client } = await account(event);
    const name = String((await event.request.formData()).get('name') ?? '').trim();
    if (!name || name.length > 100) return fail(400, { message: 'Name must be 1–100 characters.', success: null });
    try {
      const { error } = await client.auth.updateUser({ data: { display_name: name } });
      if (error) return fail(400, { message: 'Unable to save your profile.', success: null });
      return { success: 'Profile saved.', message: null };
    } catch { return fail(502, { message: 'Account service is unavailable. Please try again.', success: null }); }
  },
  password: async event => {
    const { client, user } = await account(event);
    if (!user.email) return fail(400, { message: 'This account has no email address for password recovery.', success: null });
    try {
      const { error } = await client.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${event.url.origin}/auth/callback?next=/update-password`
      });
      if (error) return fail(502, { message: 'Unable to request a reset email. Please try again later.', success: null });
      return { success: 'Check your account email for a password reset link.', message: null };
    } catch { return fail(502, { message: 'Unable to reach the email service. Please try again.', success: null }); }
  },
  sessions: async event => {
    const { client } = await account(event);
    try {
      const { error } = await client.auth.signOut({ scope: 'others' });
      if (error) return fail(400, { message: 'Unable to sign out other devices. Please sign in again and retry.', success: null });
      return { success: 'Other devices will need to sign in again when their session refreshes. This device stays signed in.', message: null };
    } catch { return fail(502, { message: 'Account service is unavailable. Please try again.', success: null }); }
  }
};
