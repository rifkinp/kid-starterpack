-- Run in your Supabase project SQL Editor or a managed migration workflow.
-- The browser receives a publishable key only. RLS enforces per-user isolation.
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  created_at timestamptz not null default now()
);
create index if not exists notes_owner_created_idx on public.notes (user_id, created_at desc);
alter table public.notes enable row level security;
revoke all on public.notes from anon;
grant select, insert, update, delete on public.notes to authenticated;

drop policy if exists notes_read_own on public.notes;
create policy notes_read_own on public.notes for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists notes_insert_own on public.notes;
create policy notes_insert_own on public.notes for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists notes_update_own on public.notes;
create policy notes_update_own on public.notes for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists notes_delete_own on public.notes;
create policy notes_delete_own on public.notes for delete to authenticated
  using (user_id = (select auth.uid()));
