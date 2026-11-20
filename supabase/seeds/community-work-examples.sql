-- 工作台待办示例：持久化到共享数据，保留既有患者的评估、方案和接收历史。
begin;
insert into public.patients (id,name,gender,age,diagnosis,source,community_stage)
values ('c0110000-0000-4000-8000-000000000001','陈桂芳','女',72,'待评估（示例）','小市社区','新接收')
on conflict (id) do nothing;

insert into public.nurse_tasks (id,patient_id,title,kind,due_text)
values ('c0110000-0000-4000-8000-000000000002','7f03e480-c4cf-4627-b8e0-0043c5fccd08','AD-8 初筛评估申请','待办','家庭申请社区评估（示例）'),
('c0110000-0000-4000-8000-000000000003','c0110000-0000-4000-8000-000000000001','认知健康与家庭支持宣教（示例）','宣教','今日 10:00')
on conflict (id) do nothing;

insert into public.followups (id,patient_id,item,note)
values ('c0110000-0000-4000-8000-000000000004','7f03e480-c4cf-4627-b8e0-0043c5fccd08','认知健康与家庭训练情况回访（示例）','工作台待随访示例')
on conflict (id) do nothing;

-- 独立示例患者复用已确认模型方案的训练内容，只补充本次明确排期；不改原患者方案。
with source as (
  select ai_plan, cognitive_risk from public.patients
  where name='周春华' and ai_plan is not null and ai_plan_confirmed_at >= ai_plan_at limit 1
), sample as (
  select jsonb_set(jsonb_set(ai_plan, '{start_date}', to_jsonb((now() at time zone 'Asia/Shanghai')::date::text)), '{training}',
    (select jsonb_agg(case when ord=1 then item || jsonb_build_object('dates',jsonb_build_array((now() at time zone 'Asia/Shanghai')::date::text)) else item end order by ord)
     from jsonb_array_elements(ai_plan->'training') with ordinality as t(item,ord)))
    || jsonb_build_object('summary','工作台今日训练示例：复用已确认模型方案内容，独立演示患者，不构成真实诊疗建议。') as plan,
    cognitive_risk from source
), added as (
  insert into public.patients (id,name,gender,age,diagnosis,source,community_stage,ad8,cognitive_risk,ai_plan,ai_plan_at,ai_plan_confirmed_at,ai_plan_confirmed_by)
  select 'c0110000-0000-4000-8000-000000000005','沈玉兰','女',75,'训练排期示例（非诊断）','小市社区','干预中',3,cognitive_risk,plan,now(),now(),'鼓楼医院记忆门诊（演示确认）' from sample
  on conflict (id) do nothing returning id,ai_plan,cognitive_risk
)
insert into public.treatment_plans (patient_id,plan,risk,confirmed_at,confirmed_by)
select id,ai_plan,cognitive_risk,now(),'鼓楼医院记忆门诊（演示确认）' from added;

insert into public.referrals (id,patient_id,direction,status,from_hospital,to_community,reason)
values ('c0110000-0000-4000-8000-000000000006','3e7132a5-4605-4fc6-a9c6-686bd07fb0de','下转','待接收','南京市鼓楼医院','小市社区','社区承接待办示例；保留既有接收历史')
on conflict (id) do nothing;
commit;