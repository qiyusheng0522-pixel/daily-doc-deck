-- 演示：为部分社区在管患者补充"医生已确认"的示例训练方案（复用王建国方案结构），其余中高风险患者仍待医生审核。
with src as (select ai_plan from public.patients where name='王建国' and ai_plan is not null limit 1),
upd as (
  update public.patients p set ai_plan = (select ai_plan from src), ai_plan_at = now(),
    ai_plan_confirmed_at = now(), ai_plan_confirmed_by = '鼓楼医院记忆门诊（示例）'
  where p.name in ('周春华','李建国') and p.ai_plan is null
  returning p.id, p.ai_plan, p.cognitive_risk
)
insert into public.treatment_plans (patient_id, plan, risk, confirmed_at, confirmed_by)
select id, ai_plan, cognitive_risk, now(), '鼓楼医院记忆门诊（示例）' from upd;
