create table public.nurse_tasks (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  title text not null,
  kind text not null default '待办' check (kind in ('待办', '宣教', '出院下转')),
  due_text text,
  status text not null default '待执行' check (status in ('待执行', '已完成')),
  source_plan_id uuid references public.care_plans(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.nurse_tasks to authenticated;
grant insert, update, delete on public.nurse_tasks to authenticated;
grant all on public.nurse_tasks to service_role;

alter table public.nurse_tasks enable row level security;

create policy tasks_read on public.nurse_tasks
  for select to authenticated using (true);
create policy tasks_nurse_insert on public.nurse_tasks
  for insert to authenticated with check (public.has_role(auth.uid(), 'nurse'));
create policy tasks_nurse_update on public.nurse_tasks
  for update to authenticated using (public.has_role(auth.uid(), 'nurse')) with check (public.has_role(auth.uid(), 'nurse'));

create table public.education_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  duration text not null default '5 min',
  description text,
  created_at timestamptz not null default now()
);

grant select on public.education_items to authenticated;
grant insert, update, delete on public.education_items to authenticated;
grant all on public.education_items to service_role;

alter table public.education_items enable row level security;

create policy edu_items_read on public.education_items
  for select to authenticated using (true);
create policy edu_items_staff_write on public.education_items
  for insert to authenticated with check (public.has_role(auth.uid(), 'nurse') or public.has_role(auth.uid(), 'community'));
create policy edu_items_staff_update on public.education_items
  for update to authenticated using (public.has_role(auth.uid(), 'nurse') or public.has_role(auth.uid(), 'community')) with check (public.has_role(auth.uid(), 'nurse') or public.has_role(auth.uid(), 'community'));

create table public.patient_education (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  education_item_id uuid not null references public.education_items(id) on delete cascade,
  status text not null default '未读' check (status in ('未读', '已读')),
  pushed_at timestamptz not null default now(),
  read_at timestamptz,
  unique (patient_id, education_item_id)
);

grant select on public.patient_education to authenticated;
grant insert, update, delete on public.patient_education to authenticated;
grant all on public.patient_education to service_role;

alter table public.patient_education enable row level security;

create policy patient_edu_read on public.patient_education
  for select to authenticated using (true);
create policy patient_edu_staff_write on public.patient_education
  for insert to authenticated with check (public.has_role(auth.uid(), 'nurse') or public.has_role(auth.uid(), 'community'));
create policy patient_edu_update on public.patient_education
  for update to authenticated using (public.is_program_member()) with check (public.is_program_member());

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  from_hospital text not null default '南京市鼓楼医院',
  to_community text not null default '兰园社区',
  reason text,
  status text not null default '待接收' check (status in ('待接收', '已接收')),
  doctor_name text,
  created_at timestamptz not null default now(),
  received_at timestamptz
);

grant select on public.referrals to authenticated;
grant insert, update, delete on public.referrals to authenticated;
grant all on public.referrals to service_role;

alter table public.referrals enable row level security;

create policy referrals_read on public.referrals
  for select to authenticated using (true);
create policy referrals_staff_insert on public.referrals
  for insert to authenticated with check (public.has_role(auth.uid(), 'nurse') or public.has_role(auth.uid(), 'doctor'));
create policy referrals_community_update on public.referrals
  for update to authenticated using (public.has_role(auth.uid(), 'community')) with check (public.has_role(auth.uid(), 'community'));

create table public.followups (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  status text not null default '待随访' check (status in ('待随访', '需复访', '已完成')),
  item text not null,
  post_discharge_day integer,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.followups to authenticated;
grant insert, update, delete on public.followups to authenticated;
grant all on public.followups to service_role;

alter table public.followups enable row level security;

create policy followups_read on public.followups
  for select to authenticated using (true);
create policy followups_community_insert on public.followups
  for insert to authenticated with check (public.has_role(auth.uid(), 'community') or public.has_role(auth.uid(), 'nurse'));
create policy followups_community_update on public.followups
  for update to authenticated using (public.has_role(auth.uid(), 'community') or public.has_role(auth.uid(), 'nurse')) with check (public.has_role(auth.uid(), 'community') or public.has_role(auth.uid(), 'nurse'));

create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  status text not null default '已上传' check (status in ('已上传', '已接收')),
  note text,
  created_at timestamptz not null default now()
);

grant select on public.uploads to authenticated;
grant insert, update, delete on public.uploads to authenticated;
grant all on public.uploads to service_role;

alter table public.uploads enable row level security;

create policy uploads_read on public.uploads
  for select to authenticated using (true);
create policy uploads_community_insert on public.uploads
  for insert to authenticated with check (public.has_role(auth.uid(), 'community'));
create policy uploads_update on public.uploads
  for update to authenticated using (public.is_program_member()) with check (public.is_program_member());

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  sender_role text not null check (sender_role in ('patient', 'doctor', 'nurse', 'community')),
  sender_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);

grant select on public.chat_messages to authenticated;
grant insert, update, delete on public.chat_messages to authenticated;
grant all on public.chat_messages to service_role;

alter table public.chat_messages enable row level security;

create policy chat_read on public.chat_messages
  for select to authenticated using (true);
create policy chat_member_insert on public.chat_messages
  for insert to authenticated with check (public.is_program_member());