-- Run once in your own Supabase SQL Editor, before adding the publishable key.
create table if not exists public.numi_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 5000000),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.numi_progress enable row level security;
revoke all on public.numi_progress from anon;
grant select, insert, update, delete on public.numi_progress to authenticated;
drop policy if exists numi_read_own on public.numi_progress;
drop policy if exists numi_insert_own on public.numi_progress;
drop policy if exists numi_update_own on public.numi_progress;
drop policy if exists numi_delete_own on public.numi_progress;
create policy numi_read_own on public.numi_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy numi_insert_own on public.numi_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy numi_update_own on public.numi_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy numi_delete_own on public.numi_progress for delete to authenticated using ((select auth.uid()) = user_id);
