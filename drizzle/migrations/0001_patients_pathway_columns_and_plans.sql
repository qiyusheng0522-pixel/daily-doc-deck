create or replace function public.is_program_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.user_roles where user_id = auth.uid()
  )
$fn$;

alter table public.patients
  add column if not exists id_no text,
  add column if not exists vip boolean not null default false,
  add column if not exists stroke_type text,
  add column if not exists condition_category text,
  add column if not exists hospital_stage text check (hospital_stage in ('待入院', '院中', '待出院', '历史')),
  add column if not exists community_stage text check (community_stage in ('新接收', '随访中', '复诊待约', '历史')),
  add column if not exists abnormal boolean not null default false,
  add column if not exists last_visit text,
  add column if not exists refer_dept text,
  add column if not exists refer_doctor text,
  add column if not exists nihss text,
  add column if not exists mrs text,
  add column if not exists limb_power text,
  add column if not exists bp text,
  add column if not exists hr text,
  add column if not exists ldl text,
  add column if not exists glucose text,
  add column if not exists vitals_flags jsonb not null default '{}'::jsonb,
  add column if not exists risk_tags text[] not null default '{}',
  add column if not exists lifestyle_warnings text[] not null default '{}';

comment on column public.patients.status is 'DEPRECATED: clinic appointment status, unused by the stroke pathway screens; use hospital_stage and community_stage';

create table public.patient_checkins (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  recorded_on date not null default current_date,
  diet_kcal integer,
  exercise_min integer,
  med_adherence integer,
  sleep_hours numeric(4, 1),
  bp_morning text,
  created_at timestamptz not null default now(),
  unique (patient_id, recorded_on)
);

grant select on public.patient_checkins to authenticated;
grant insert, update, delete on public.patient_checkins to authenticated;
grant all on public.patient_checkins to service_role;

alter table public.patient_checkins enable row level security;

create policy checkins_read on public.patient_checkins
  for select to authenticated using (true);
create policy checkins_write on public.patient_checkins
  for insert to authenticated with check (public.is_program_member());
create policy checkins_update on public.patient_checkins
  for update to authenticated using (public.is_program_member()) with check (public.is_program_member());

create table public.care_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  disease text not null,
  department text not null default '神经内科',
  period_start date,
  period_end date,
  open_ended boolean not null default false,
  status text not null default '进行中' check (status in ('进行中', '已过期')),
  note text,
  doctor_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.care_plans to authenticated;
grant insert, update, delete on public.care_plans to authenticated;
grant all on public.care_plans to service_role;

alter table public.care_plans enable row level security;

create policy plans_read on public.care_plans
  for select to authenticated using (true);
create policy plans_doctor_write on public.care_plans
  for insert to authenticated with check (public.has_role(auth.uid(), 'doctor'));
create policy plans_doctor_update on public.care_plans
  for update to authenticated using (public.has_role(auth.uid(), 'doctor')) with check (public.has_role(auth.uid(), 'doctor'));

create table public.plan_reviews (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  disease text not null,
  department text not null default '神经内科',
  category text not null check (category in ('需就诊', '目标和方案', '康复训练')),
  summary text not null,
  status text not null default '审核中' check (status in ('审核中', '已审核', '已通过')),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

grant select on public.plan_reviews to authenticated;
grant insert, update, delete on public.plan_reviews to authenticated;
grant all on public.plan_reviews to service_role;

alter table public.plan_reviews enable row level security;

create policy reviews_read on public.plan_reviews
  for select to authenticated using (true);
create policy reviews_doctor_write on public.plan_reviews
  for insert to authenticated with check (public.has_role(auth.uid(), 'doctor'));
create policy reviews_doctor_update on public.plan_reviews
  for update to authenticated using (public.has_role(auth.uid(), 'doctor')) with check (public.has_role(auth.uid(), 'doctor'));