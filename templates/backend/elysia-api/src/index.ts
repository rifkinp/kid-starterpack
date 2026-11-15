import { createApp } from './app';
const port = Number(Bun.env.PORT || 3001);
createApp().listen(port);
console.log(`Kid Elysia API listening on http://localhost:${port} (docs: /openapi)`);
