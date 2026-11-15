import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.supabase) redirect(303, '/');
  const { data: { user }, error } = await locals.supabase.auth.getUser();
  if (error || !user) redirect(303, '/login');
  return { user: { id: user.id, email: user.email ?? '' } };
};
