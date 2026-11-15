import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const url = env.PUBLIC_SUPABASE_URL;
  const key = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  event.locals.supabase = url && key && !url.includes('YOUR_PROJECT')
    ? createServerClient(url, key, {
        cookies: {
          getAll: () => event.cookies.getAll(),
          setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) =>
            event.cookies.set(name, value, { ...options, path: '/' }))
        }
      })
    : null;
  // Avoid caching authenticated SSR responses in intermediary/CDN caches.
  event.setHeaders({ 'cache-control': 'private, no-store' });
  return resolve(event, {
    filterSerializedResponseHeaders: (name) => name === 'content-range' || name === 'x-supabase-api-version'
  });
};
