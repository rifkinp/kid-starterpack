import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = null;
  // Allow the welcome/setup page to work before configuring external services.
  if (!auth || !process.env.BETTER_AUTH_URL) {
    if (event.url.pathname.startsWith('/api/auth')) return new Response('Auth is not configured', { status: 503 });
    return resolve(event);
  }
  const session = await auth.api.getSession({ headers: event.request.headers });
  if (session) event.locals.user = { id: session.user.id, name: session.user.name, email: session.user.email };
  const response = await svelteKitHandler({ event, resolve, auth, building });
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
};
