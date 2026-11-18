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
