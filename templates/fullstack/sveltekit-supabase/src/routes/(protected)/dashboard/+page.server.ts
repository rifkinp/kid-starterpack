import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireSupabase } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
  const client = requireSupabase(event);
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect(303, '/login');
  const { data: notes, error } = await client.from('notes').select('id,title,created_at').order('created_at', { ascending: false }).limit(100);
  return { notes: notes ?? [], loadError: error ? 'Unable to load notes. Apply the SQL migration and review RLS.' : null };
};
export const actions: Actions = {
  add: async (event) => {
    const client = requireSupabase(event);
    const { data: { user } } = await client.auth.getUser();
    if (!user) redirect(303, '/login');
    const title = String((await event.request.formData()).get('title') ?? '').trim();
    if (!title || title.length > 160) return fail(400, { message: 'Enter a title (1-160 characters).' });
    const { error } = await client.from('notes').insert({ title, user_id: user.id });
    if (error) return fail(400, { message: 'Unable to save note. Check the RLS migration.' });
    return { success: true };
  },
  delete: async (event) => {
    const client = requireSupabase(event);
    const { data: { user } } = await client.auth.getUser();
    if (!user) redirect(303, '/login');
    const id = String((await event.request.formData()).get('id') ?? '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail(400, { message: 'Invalid note id.' });
    const { error } = await client.from('notes').delete().eq('id', id).eq('user_id', user.id);
    if (error) return fail(400, { message: 'Unable to delete note.' });
    return { success: true };
  }
};
