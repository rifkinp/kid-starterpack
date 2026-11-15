import { Elysia, t } from 'elysia';
import { openapi } from '@elysia/openapi';

// Demo in-memory store. Do not use this data model for persistent production records.
type Task = { id: string; title: string; done: boolean };
export function createApp() {
  const tasks = new Map<string, Task>();
  return new Elysia()
    .use(openapi({ documentation: { info: { title: 'Kid Elysia API', version: '0.1.0' } } }))
    .get('/health', () => ({ status: 'ok', service: 'kid-elysia-api' }), {
      detail: { summary: 'Health check' }
    })
    .get('/api/tasks', () => [...tasks.values()], { detail: { summary: 'List demo tasks' } })
    .post('/api/tasks', ({ body, set }) => {
      const task: Task = { id: crypto.randomUUID(), title: body.title, done: false };
      tasks.set(task.id, task);
      set.status = 201;
      return task;
    }, { body: t.Object({ title: t.String({ minLength: 1, maxLength: 160 }) }), detail: { summary: 'Create task' } })
    .patch('/api/tasks/:id', ({ params, body, set }) => {
      const item = tasks.get(params.id);
      if (!item) { set.status = 404; return { error: 'Task not found' }; }
      const updated = { ...item, ...body }; tasks.set(item.id, updated); return updated;
    }, { params: t.Object({ id: t.String() }), body: t.Object({ done: t.Boolean() }), detail: { summary: 'Update task' } })
    .delete('/api/tasks/:id', ({ params, set }) => {
      if (!tasks.delete(params.id)) { set.status = 404; return { error: 'Task not found' }; }
      return { deleted: true };
    }, { params: t.Object({ id: t.String() }), detail: { summary: 'Delete task' } });
}
