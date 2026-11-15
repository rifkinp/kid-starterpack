import { expect, test } from 'bun:test';
import { createApp } from './app';

test('health check', async () => {
  const response = await createApp().handle(new Request('http://localhost/health'));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok', service: 'kid-elysia-api' });
});

test('create and list a demo task', async () => {
  const app = createApp();
  const created = await app.handle(new Request('http://localhost/api/tasks', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'First task' })
  }));
  expect(created.status).toBe(201);
  const listed = await app.handle(new Request('http://localhost/api/tasks'));
  const tasks = (await listed.json()) as { title: string }[];
  expect(tasks).toHaveLength(1);
  expect(tasks[0].title).toBe('First task');
});
