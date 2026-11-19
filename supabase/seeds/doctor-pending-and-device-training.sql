-- 医生端待接收示例：社区已审批转出、等待上级医院接收的中高风险老人
INSERT INTO public.patients (name, gender, age, phone, diagnosis, source, status, cognitive_risk, ad8, mmse, moca, caregiver, community_stage, next_reassess)
SELECT v.name, v.gender, v.age, v.phone, '认知功能下降待进一步评估', '小市社区', '候诊中', v.risk, v.ad8, v.mmse, v.moca, v.caregiver, '干预中', v.reassess
FROM (VALUES
 ('吴桂兰','女',75,'13851230011','中风险',3,24,20,'女儿 吴敏','6月'),
 ('钱德明','男',78,'13851230012','高风险',5,19,15,'儿子 钱勇','3月'),
 ('黄玉芳','女',73,'13851230013','中风险',3,25,21,'老伴 黄建','6月')
) v(name,gender,age,phone,risk,ad8,mmse,moca,caregiver,reassess)
WHERE NOT EXISTS (SELECT 1 FROM public.patients p WHERE p.name=v.name);

INSERT INTO public.referrals (patient_id, from_hospital, to_community, reason, direction, status, dept, doctor_name, approval_status, approval_note, approved_at)
SELECT p.id, '小市社区', '南京市鼓楼医院', 'AD-8 '||p.ad8||'，MMSE '||p.mmse||'，MoCA '||p.moca||'，'||p.cognitive_risk||'，申请记忆门诊进一步评估（示例）', '上转', '待接收', '记忆门诊', '张主任', '已转出', '同意转诊（示例）', now()
FROM public.patients p WHERE p.name IN ('吴桂兰','钱德明','黄玉芳')
AND NOT EXISTS (SELECT 1 FROM public.referrals r WHERE r.patient_id=p.id AND r.direction='上转');

-- 设备训练记录示例（认知训练设备同步）
INSERT INTO public.training_records (patient_id, trained_on, training_time, domain, activity, setting, duration_min, completion, operator, record_type, feedback)
SELECT p.id, (current_date - s.d), s.t::time, s.domain, s.activity, '站内设备', s.m, '完成', '认知训练设备 · 示例', '设备训练', s.fb
FROM public.patients p CROSS JOIN (VALUES
 (2,'09:30','记忆','数字记忆广度训练',20,'正确率 78%，难度 L3'),
 (5,'10:00','注意','视觉搜索专注训练',15,'正确率 85%，反应时 1.2s'),
 (9,'09:45','执行','路径规划训练',20,'完成 6/8 关')
) s(d,t,domain,activity,m,fb)
WHERE p.name IN ('刘美琳','王建国','李建国','孙丽华')
AND NOT EXISTS (SELECT 1 FROM public.training_records t WHERE t.patient_id=p.id AND t.record_type='设备训练');
