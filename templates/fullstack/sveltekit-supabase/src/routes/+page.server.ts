import { env } from '$env/dynamic/public';
export const load = () => ({ configured: Boolean(env.PUBLIC_SUPABASE_URL && env.PUBLIC_SUPABASE_PUBLISHABLE_KEY && !env.PUBLIC_SUPABASE_URL.includes('YOUR_PROJECT')) });
