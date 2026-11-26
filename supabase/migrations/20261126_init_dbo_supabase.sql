-- DBO Basketball Academy - Supabase Schema & Exact-Time pg_cron Notifications
create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.dbo_app_state (
  id text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.dbo_app_state enable row level security;

create table if not exists public.dbo_students (
  id integer primary key,
  name text not null,
  course text,
  course_type text,
  remaining integer not null default 0,
  next_renewal text,
  phone text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists idx_dbo_students_course_type on public.dbo_students (course_type);
alter table public.dbo_students enable row level security;

create table if not exists public.dbo_push_subscriptions (
  endpoint text primary key,
  keys jsonb not null,
  student_id integer,
  student_name text,
  phone text,
  role text not null default 'parent',
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists idx_dbo_push_subs_student_id on public.dbo_push_subscriptions (student_id);
create index if not exists idx_dbo_push_subs_role on public.dbo_push_subscriptions (role);
alter table public.dbo_push_subscriptions enable row level security;

create table if not exists public.dbo_cron_logs (
  id bigint generated always as identity primary key,
  job_name text not null,
  action text not null,
  triggered_at timestamptz not null default now()
);
alter table public.dbo_cron_logs enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant all privileges on table public.dbo_app_state to service_role;
grant all privileges on table public.dbo_students to service_role;
grant all privileges on table public.dbo_push_subscriptions to service_role;
grant all privileges on table public.dbo_cron_logs to service_role;
grant select, insert, update on table public.dbo_app_state to anon, authenticated;
grant select, insert, update on table public.dbo_students to anon, authenticated;
grant select, insert, update, delete on table public.dbo_push_subscriptions to anon, authenticated;
grant select on table public.dbo_cron_logs to anon, authenticated;

drop policy if exists "dbo_app_state_access" on public.dbo_app_state;
create policy "dbo_app_state_access" on public.dbo_app_state for all to anon, authenticated using (true) with check (true);

drop policy if exists "dbo_students_access" on public.dbo_students;
create policy "dbo_students_access" on public.dbo_students for all to anon, authenticated using (true) with check (true);

drop policy if exists "dbo_push_subs_access" on public.dbo_push_subscriptions;
create policy "dbo_push_subs_access" on public.dbo_push_subscriptions for all to anon, authenticated using (true) with check (true);

drop policy if exists "dbo_cron_logs_read" on public.dbo_cron_logs;
create policy "dbo_cron_logs_read" on public.dbo_cron_logs for select to anon, authenticated using (true);

create or replace function public.trigger_dbo_push_cron(p_job_name text, p_action text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.dbo_cron_logs (job_name, action, triggered_at)
  values (p_job_name, p_action, now());

  perform net.http_get(
    url := 'https://dbobasketball.vercel.app/api/push?action=' || p_action || '&source=supabase_pg_cron'
  );
end;
$$;
revoke execute on function public.trigger_dbo_push_cron(text, text) from public, anon, authenticated;

select cron.schedule('dbo-morning-1000', '0 3 * * *', $$select public.trigger_dbo_push_cron('dbo-morning-1000', 'cron_morning');$$);
select cron.schedule('dbo-weekday-rem30-1700', '0 10 * * 1,2,4', $$select public.trigger_dbo_push_cron('dbo-weekday-rem30-1700', 'cron_reminder_30m');$$);
select cron.schedule('dbo-weekday-rem15-1715', '15 10 * * 1,2,4', $$select public.trigger_dbo_push_cron('dbo-weekday-rem15-1715', 'cron_reminder_15m');$$);
select cron.schedule('dbo-weekday-end15-1915', '15 12 * * 1,2,4', $$select public.trigger_dbo_push_cron('dbo-weekday-end15-1915', 'cron_end_15m');$$);
select cron.schedule('dbo-sat-rem30-1530', '30 8 * * 6', $$select public.trigger_dbo_push_cron('dbo-sat-rem30-1530', 'cron_reminder_30m');$$);
select cron.schedule('dbo-sat-rem15-1545', '45 8 * * 6', $$select public.trigger_dbo_push_cron('dbo-sat-rem15-1545', 'cron_reminder_15m');$$);
select cron.schedule('dbo-sat-end15-1715', '15 10 * * 6', $$select public.trigger_dbo_push_cron('dbo-sat-end15-1715', 'cron_end_15m');$$);
