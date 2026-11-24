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

-- ---------------- Classroom, Roles & Weekly Assignments ----------------
create table if not exists public.numi_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 50),
  role text not null default 'student' check (role in ('teacher', 'student')),
  grade integer not null default 1 check (grade between 1 and 9),
  avatar text not null default 'bunny',
  updated_at timestamptz not null default now()
);

create table if not exists public.numi_classrooms (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  grade integer not null default 1 check (grade between 1 and 9),
  join_code text not null unique check (char_length(join_code) = 6),
  created_at timestamptz not null default now()
);

create table if not exists public.numi_enrollments (
  classroom_id uuid not null references public.numi_classrooms(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (classroom_id, student_id)
);

create table if not exists public.numi_assignments (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.numi_classrooms(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  due_date date,
  config jsonb not null check (jsonb_typeof(config) = 'object'),
  created_at timestamptz not null default now()
);

create table if not exists public.numi_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.numi_assignments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  correct integer not null check (correct >= 0),
  total integer not null check (total > 0),
  avg_time numeric not null default 0,
  completed_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

alter table public.numi_profiles enable row level security;
alter table public.numi_classrooms enable row level security;
alter table public.numi_enrollments enable row level security;
alter table public.numi_assignments enable row level security;
alter table public.numi_submissions enable row level security;

revoke all on public.numi_profiles, public.numi_classrooms, public.numi_enrollments, public.numi_assignments, public.numi_submissions from anon;
grant select, insert, update, delete on public.numi_profiles, public.numi_classrooms, public.numi_enrollments, public.numi_assignments, public.numi_submissions to authenticated;

-- Profiles: own profile or students enrolled in teacher's classroom
drop policy if exists numi_profiles_own on public.numi_profiles;
create policy numi_profiles_own on public.numi_profiles for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists numi_profiles_teacher_read on public.numi_profiles;
create policy numi_profiles_teacher_read on public.numi_profiles for select to authenticated
  using (exists (
    select 1 from public.numi_enrollments e
    join public.numi_classrooms c on c.id = e.classroom_id
    where e.student_id = numi_profiles.user_id and c.teacher_id = (select auth.uid())
  ));

-- Classrooms: teacher owns, enrolled students can read
drop policy if exists numi_classrooms_teacher on public.numi_classrooms;
create policy numi_classrooms_teacher on public.numi_classrooms for all to authenticated
  using (teacher_id = (select auth.uid()))
  with check (teacher_id = (select auth.uid()));

drop policy if exists numi_classrooms_student_read on public.numi_classrooms;
create policy numi_classrooms_student_read on public.numi_classrooms for select to authenticated
  using (exists (
    select 1 from public.numi_enrollments e
    where e.classroom_id = numi_classrooms.id and e.student_id = (select auth.uid())
  ));

-- Enrollments: student reads/leaves own; teacher reads/removes students in own classrooms
drop policy if exists numi_enrollments_student on public.numi_enrollments;
create policy numi_enrollments_student on public.numi_enrollments for select to authenticated
  using (student_id = (select auth.uid()));

drop policy if exists numi_enrollments_teacher on public.numi_enrollments;
create policy numi_enrollments_teacher on public.numi_enrollments for all to authenticated
  using (exists (
    select 1 from public.numi_classrooms c
    where c.id = numi_enrollments.classroom_id and c.teacher_id = (select auth.uid())
  ));

-- Assignments: teacher manages own classroom assignments; enrolled students can read
drop policy if exists numi_assignments_teacher on public.numi_assignments;
create policy numi_assignments_teacher on public.numi_assignments for all to authenticated
  using (exists (
    select 1 from public.numi_classrooms c
    where c.id = numi_assignments.classroom_id and c.teacher_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.numi_classrooms c
    where c.id = numi_assignments.classroom_id and c.teacher_id = (select auth.uid())
  ));

drop policy if exists numi_assignments_student_read on public.numi_assignments;
create policy numi_assignments_student_read on public.numi_assignments for select to authenticated
  using (exists (
    select 1 from public.numi_enrollments e
    where e.classroom_id = numi_assignments.classroom_id and e.student_id = (select auth.uid())
  ));

-- Submissions: student manages own; teacher reads submissions for own classrooms
drop policy if exists numi_submissions_student on public.numi_submissions;
create policy numi_submissions_student on public.numi_submissions for all to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

drop policy if exists numi_submissions_teacher_read on public.numi_submissions;
create policy numi_submissions_teacher_read on public.numi_submissions for select to authenticated
  using (exists (
    select 1 from public.numi_assignments a
    join public.numi_classrooms c on c.id = a.classroom_id
    where a.id = numi_submissions.assignment_id and c.teacher_id = (select auth.uid())
  ));

-- Secure RPC so students can join a classroom by 6-char code without exposing all classrooms
create or replace function public.join_classroom_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_classroom_id uuid;
begin
  select id into v_classroom_id from public.numi_classrooms where upper(join_code) = upper(trim(p_code)) limit 1;
  if v_classroom_id is null then
    raise exception 'Classroom code not found';
  end if;
  insert into public.numi_enrollments (classroom_id, student_id)
  values (v_classroom_id, auth.uid())
  on conflict do nothing;
  return v_classroom_id;
end;
$$;
revoke all on function public.join_classroom_by_code(text) from public;
grant execute on function public.join_classroom_by_code(text) to authenticated;

-- ---------------- v2.5: class mirror (safe to re-run) ----------------
alter table public.numi_classrooms drop constraint if exists numi_classrooms_join_code_check;
alter table public.numi_classrooms add constraint numi_classrooms_join_code_check check (char_length(join_code) between 4 and 10);
alter table public.numi_classrooms add column if not exists level text not null default 'primary';
alter table public.numi_classrooms add column if not exists teacher_name text not null default '';
alter table public.numi_classrooms add column if not exists teacher_username text not null default '';
alter table public.numi_classrooms add column if not exists local_id text;
create unique index if not exists numi_classrooms_local_id_key on public.numi_classrooms(teacher_id, local_id);
alter table public.numi_profiles add column if not exists username text;
alter table public.numi_assignments add column if not exists local_id text;
alter table public.numi_assignments add column if not exists target_students text[] not null default '{}';
create unique index if not exists numi_assignments_local_id_key on public.numi_assignments(classroom_id, local_id);

-- One compact stats row per student; teachers read it (never the full numi_progress payload).
create table if not exists public.numi_student_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text not null default '',
  grade integer not null default 1,
  summary jsonb not null default '{}'::jsonb check (jsonb_typeof(summary) = 'object' and octet_length(summary::text) <= 200000),
  updated_at timestamptz not null default now()
);
alter table public.numi_student_stats enable row level security;
revoke all on public.numi_student_stats from anon;
grant select, insert, update, delete on public.numi_student_stats to authenticated;
drop policy if exists numi_stats_own on public.numi_student_stats;
create policy numi_stats_own on public.numi_student_stats for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists numi_stats_teacher_read on public.numi_student_stats;
create policy numi_stats_teacher_read on public.numi_student_stats for select to authenticated
  using (exists (
    select 1 from public.numi_enrollments e
    join public.numi_classrooms c on c.id = e.classroom_id
    where e.student_id = numi_student_stats.user_id and c.teacher_id = (select auth.uid())
  ));

-- Code lookup works before sign-in (the code is the secret) so a new device can preview the class.
create or replace function public.numi_lookup_class(p_code text)
returns json language sql security definer set search_path = public stable as $$
  select json_build_object('name', name, 'grade', grade, 'level', level, 'teacher_name', teacher_name,
                           'teacher_username', teacher_username, 'code', join_code)
  from public.numi_classrooms where upper(join_code) = upper(trim(p_code)) limit 1
$$;
revoke all on function public.numi_lookup_class(text) from public;
grant execute on function public.numi_lookup_class(text) to anon, authenticated;

create or replace function public.numi_join_class(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare c public.numi_classrooms;
begin
  select * into c from public.numi_classrooms where upper(join_code) = upper(trim(p_code)) limit 1;
  if c.id is null then raise exception 'Classroom code not found'; end if;
  insert into public.numi_enrollments (classroom_id, student_id) values (c.id, auth.uid()) on conflict do nothing;
  return json_build_object('id', c.id, 'name', c.name, 'grade', c.grade, 'level', c.level,
                           'teacher_name', c.teacher_name, 'teacher_username', c.teacher_username, 'code', c.join_code);
end $$;
revoke all on function public.numi_join_class(text) from public;
grant execute on function public.numi_join_class(text) to authenticated;

-- ---------------- v2.5 fix: break RLS recursion (classrooms <-> enrollments) ----------------
create or replace function public.numi_is_teacher_of(cid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.numi_classrooms where id = cid and teacher_id = auth.uid())
$$;
create or replace function public.numi_is_enrolled(cid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.numi_enrollments where classroom_id = cid and student_id = auth.uid())
$$;
create or replace function public.numi_teacher_of_student(sid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.numi_enrollments e join public.numi_classrooms c on c.id = e.classroom_id
    where e.student_id = sid and c.teacher_id = auth.uid())
$$;
create or replace function public.numi_teacher_of_assignment(aid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.numi_assignments a join public.numi_classrooms c on c.id = a.classroom_id
    where a.id = aid and c.teacher_id = auth.uid())
$$;
revoke all on function public.numi_is_teacher_of(uuid), public.numi_is_enrolled(uuid),
  public.numi_teacher_of_student(uuid), public.numi_teacher_of_assignment(uuid) from public;
grant execute on function public.numi_is_teacher_of(uuid), public.numi_is_enrolled(uuid),
  public.numi_teacher_of_student(uuid), public.numi_teacher_of_assignment(uuid) to authenticated;

drop policy if exists numi_classrooms_student_read on public.numi_classrooms;
create policy numi_classrooms_student_read on public.numi_classrooms for select to authenticated
  using (public.numi_is_enrolled(id));
drop policy if exists numi_enrollments_teacher on public.numi_enrollments;
create policy numi_enrollments_teacher on public.numi_enrollments for all to authenticated
  using (public.numi_is_teacher_of(classroom_id)) with check (public.numi_is_teacher_of(classroom_id));
drop policy if exists numi_assignments_teacher on public.numi_assignments;
create policy numi_assignments_teacher on public.numi_assignments for all to authenticated
  using (public.numi_is_teacher_of(classroom_id)) with check (public.numi_is_teacher_of(classroom_id));
drop policy if exists numi_assignments_student_read on public.numi_assignments;
create policy numi_assignments_student_read on public.numi_assignments for select to authenticated
  using (public.numi_is_enrolled(classroom_id));
drop policy if exists numi_submissions_teacher_read on public.numi_submissions;
create policy numi_submissions_teacher_read on public.numi_submissions for select to authenticated
  using (public.numi_teacher_of_assignment(assignment_id));
drop policy if exists numi_profiles_teacher_read on public.numi_profiles;
create policy numi_profiles_teacher_read on public.numi_profiles for select to authenticated
  using (public.numi_teacher_of_student(user_id));
drop policy if exists numi_stats_teacher_read on public.numi_student_stats;
create policy numi_stats_teacher_read on public.numi_student_stats for select to authenticated
  using (public.numi_teacher_of_student(user_id));

-- ---------------- v2.6: persistent rate limit for the numi-signup Edge Function ----------------
-- The old in-memory counter reset whenever Supabase restarted or scaled the function.
-- Only a SHA-256 hash of the caller IP is stored, and rows older than 1 hour are purged.
create table if not exists public.numi_signup_hits (
  ip_hash text not null,
  hit_at  timestamptz not null default now()
);
create index if not exists numi_signup_hits_ip_time on public.numi_signup_hits (ip_hash, hit_at);
alter table public.numi_signup_hits enable row level security; -- no policies: clients cannot read or write it

create or replace function public.numi_signup_allowed(p_ip_hash text, p_max int default 40)
returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform pg_advisory_xact_lock(hashtext(p_ip_hash)); -- two requests from one IP cannot both slip through
  delete from public.numi_signup_hits where hit_at < now() - interval '1 hour';
  select count(*) into n from public.numi_signup_hits where ip_hash = p_ip_hash;
  if n >= p_max then return false; end if;
  insert into public.numi_signup_hits (ip_hash) values (p_ip_hash);
  return true;
end $$;
revoke all on function public.numi_signup_allowed(text, int) from public, anon, authenticated;
grant execute on function public.numi_signup_allowed(text, int) to service_role;
