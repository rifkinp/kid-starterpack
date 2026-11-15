import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
// Bun automatically loads .env for the Bun/Vite development command.
export const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
export const db = drizzle({ client: pool, schema });
