export const load = () => ({ configured: Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET) });
