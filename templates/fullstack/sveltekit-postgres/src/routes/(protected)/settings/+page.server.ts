import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, request }) => {
  if (!locals.user || !auth) redirect(303, '/sign-in');
  try {
    const [current, sessions] = await Promise.all([
      auth.api.getSession({ headers: request.headers }),
      auth.api.listSessions({ headers: request.headers })
    ]);
    return {
      emailVerified: current?.user.emailVerified ?? false,
      sessions: sessions.map(session => ({
        id: session.id, current: session.id === current?.session.id,
        createdAt: session.createdAt.toISOString(), expiresAt: session.expiresAt.toISOString(),
        device: session.userAgent || 'Unknown device'
      })),
      securityError: null
    };
  } catch {
    return { emailVerified: null, sessions: [], securityError: 'Sign in again to view active sessions.' };
  }
};
