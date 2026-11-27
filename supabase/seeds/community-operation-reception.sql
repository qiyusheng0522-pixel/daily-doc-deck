-- Preserve existing referral history; add a repeatable receive-to-plan scenario.
-- 低风险患者不进入下转接收流程，接收入口由中风险患者承担。
delete from public.referrals where id = 'c0260000-0000-4000-8000-000000000001' and patient_id = 'c0120000-0000-4000-8000-000000000013';

insert into public.referrals (id, patient_id, direction, status, from_hospital, to_community, doctor_name, reason)
select 'c0260000-0000-4000-8000-000000000002', id, '下转', '待接收', '南京市鼓楼医院', '小市社区', '记忆门诊医生',
  '已完成方案审核，下转小市社区按已确认方案开展训练与随访。'
from public.patients
where id = 'c0120000-0000-4000-8000-000000000015' and ai_plan_confirmed_at is not null
on conflict (id) do nothing;
