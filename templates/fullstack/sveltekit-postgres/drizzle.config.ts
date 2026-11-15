import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/server/schema.ts',
  out: './drizzle',
  tablesFilter: ['tasks'], // Better Auth manages its own user/session/account tables.
  dbCredentials: { url: process.env.DATABASE_URL! }
});
