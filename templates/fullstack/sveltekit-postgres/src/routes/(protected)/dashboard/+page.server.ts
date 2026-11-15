import { fail, redirect } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { tasks } from '$lib/server/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(303, '/sign-in');
  const rows = await db.select().from(tasks).where(eq(tasks.userId, locals.user.id)).orderBy(desc(tasks.createdAt)).limit(100);
  return { tasks: rows.map(t => ({ ...t, createdAt: t.createdAt.toISOString() })) };
};
export const actions: Actions = {
  add: async ({ locals, request }) => {
    if (!locals.user) redirect(303, '/sign-in');
    const title = String((await request.formData()).get('title') ?? '').trim();
    if (!title || title.length > 160) return fail(400, { message: 'Title must be between 1 and 160 characters.' });
    await db.insert(tasks).values({ title, userId: locals.user.id });
    return { success: true };
  },
  toggle: async ({ locals, request }) => {
    if (!locals.user) redirect(303, '/sign-in');
    const form = await request.formData(); const id = String(form.get('id') ?? '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail(400, { message: 'Invalid id.' });
    await db.update(tasks).set({ done: form.get('done') === 'true' }).where(and(eq(tasks.id,id),eq(tasks.userId,locals.user.id)));
    return { success: true };
  },
  delete: async ({ locals, request }) => {
    if (!locals.user) redirect(303, '/sign-in');
    const id=String((await request.formData()).get('id')??'');
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail(400,{message:'Invalid id.'});
    await db.delete(tasks).where(and(eq(tasks.id,id),eq(tasks.userId,locals.user.id)));
    return { success: true };
  }
};
