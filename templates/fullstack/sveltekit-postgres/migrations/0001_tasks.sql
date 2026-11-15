-- Managed application table; Better Auth creates its own auth tables via its CLI.
create table if not exists public.tasks (
 id uuid primary key default gen_random_uuid(),
 user_id text not null,
 title varchar(160) not null check (char_length(title) between 1 and 160),
 done boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists tasks_owner_created_idx on public.tasks (user_id, created_at desc);
-- This starter accesses tasks ONLY through authenticated server actions.
-- Never expose this table through a client-side Data API without additional RLS.
