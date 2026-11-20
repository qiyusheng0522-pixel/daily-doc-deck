-- Complete graded demo scenarios only; retain unassessed/ungraded intake patients.
-- Preserve existing plans, approval state, answers and training records.
-- Pending current revisions retain approval status; add check-ins against their
-- previously confirmed snapshot inside one transaction, then restore current state.
DO $$ DECLARE p public.patients%ROWTYPE; h public.treatment_plans%ROWTYPE; BEGIN
FOR p IN SELECT * FROM public.patients WHERE ai_plan IS NOT NULL AND (ai_plan_confirmed_at IS NULL OR ai_plan_confirmed_at < ai_plan_at) LOOP
 SELECT * INTO h FROM public.treatment_plans WHERE patient_id=p.id AND confirmed_at IS NOT NULL ORDER BY created_at DESC LIMIT 1;
 IF h.id IS NULL THEN CONTINUE; END IF;
 UPDATE public.patients SET ai_plan=h.plan,ai_plan_at=h.created_at,ai_plan_confirmed_at=h.confirmed_at WHERE id=p.id;
 INSERT INTO public.family_task_checkins(id,patient_id,plan_version,task_key,category,title,recorded_on,duration_min,note,recorded_by,created_at)
 SELECT md5('demo-past-family-'||p.id||s.day)::uuid,p.id,h.created_at::text,'training-'||(t.ordinality-1)::text,'训练',t.value->>'activity',s.day::date,20,s.note,'家属协助',s.day::date+time '19:00'
 FROM (SELECT * FROM jsonb_array_elements(h.plan->'training') WITH ORDINALITY x WHERE x.value->>'setting'='家庭作业' LIMIT 1) t
 CROSS JOIN (VALUES ('2026-11-12','完成物品回忆；难度：L1；训练时间：18:30。'),('2026-11-13','完成数字排序；难度：L2；训练时间：18:40。'),('2026-11-14','完成物品回忆；难度：L1；训练时间：18:30。')) s(day,note)
 ON CONFLICT DO NOTHING;
 UPDATE public.patients SET ai_plan=p.ai_plan,ai_plan_at=p.ai_plan_at,ai_plan_confirmed_at=p.ai_plan_confirmed_at WHERE id=p.id;
END LOOP; END $$;
WITH template AS (
 SELECT jsonb_build_object(
  'summary','通过认知练习与生活照护支持日常活动，循序渐进并记录训练感受。',
  'focus',jsonb_build_array('巩固记忆与注意力','维持日常生活参与','建立规律作息与安全照护'),
  'training',jsonb_build_array(
   jsonb_build_object('domain','记忆','activity','图片配对：观察生活物品图片后寻找相同图片，完成3轮，按能力调整图片数量。','frequency','每周2次','duration','每次25分钟','setting','站内小组'),
   jsonb_build_object('domain','注意力','activity','数字划消：圈出指定数字，每轮3分钟，轮间休息，完成3轮。','frequency','每周1次','duration','每次20分钟','setting','站内个训'),
   jsonb_build_object('domain','执行功能','activity','物品回忆、日历待办、模拟购物：选择两项，在家属陪伴下分步完成并记录提示次数。','frequency','每周1-2次','duration','每次20-30分钟','setting','家庭作业')),
  'interventions',jsonb_build_array(
   jsonb_build_object('category','认知训练','actions',jsonb_build_array('开展记忆与注意力训练；6-12人小组，累计20-36小时/期。'),'frequency','每周1-3次','duration','每次20-30分钟'),
   jsonb_build_object('category','风险因素管理','actions',jsonb_build_array('记录睡眠、饮食、情绪与居家安全情况，异常时联系专业人员。'),'frequency','每日观察','duration','持续记录'),
   jsonb_build_object('category','家庭作业','actions',jsonb_build_array('完成物品回忆与日历待办，家属给予提示并记录训练感受。'),'frequency','每周1-2次','duration','每次20-30分钟')),
  'followup',jsonb_build_object('cycle','每月随访1次','items',jsonb_build_array('核对训练完成与提示次数','关注睡眠、营养及居家安全')),
  'caregiver_tips',jsonb_build_array('使用短句与单步指令，留足反应时间。','疲劳或不适时暂停，不强迫继续。'),
  'red_flags',jsonb_build_array('突然意识改变、肢体无力或言语异常时立即拨打120。')) AS plan
), filled AS (
 UPDATE public.patients p SET
 ai_plan=coalesce((SELECT h.plan FROM public.treatment_plans h WHERE h.patient_id=p.id ORDER BY h.created_at DESC LIMIT 1),
 CASE WHEN p.cognitive_risk='高风险' THEN t.plan || jsonb_build_object('summary','以安全照护和熟悉日常活动为主，评估长期照护需求；家庭病床须符合准入条件后办理。','interventions',jsonb_build_array(
 jsonb_build_object('category','长期护理或家庭病床服务','actions',jsonb_build_array('评估照护需求与家庭病床准入；符合条件的行动不便对象再纳入。'),'frequency','按照护安排','duration','持续服务'),
 jsonb_build_object('category','上门评估与康复干预','actions',jsonb_build_array('家庭病床框架内安排熟悉物品识别及安全活动，按耐受分段练习。'),'frequency','按服务计划','duration','按耐受安排'),
 jsonb_build_object('category','风险因素管理','actions',jsonb_build_array('观察睡眠、营养、跌倒及用药情况，异常联系医生。'),'frequency','每日观察','duration','持续记录'),
 jsonb_build_object('category','家庭作业','actions',jsonb_build_array('家属陪伴进行熟悉物品识别与日历核对，疲劳立即暂停。'),'frequency','按耐受安排','duration','分段练习')))
 ELSE t.plan END),
 ai_plan_at='2026-11-18T09:00:00+08:00', ai_plan_confirmed_at='2026-11-18T10:00:00+08:00',ai_plan_confirmed_by='鼓楼医院记忆门诊'
 FROM template t WHERE p.ai_plan IS NULL AND p.cognitive_risk IN ('低风险','中风险','高风险','中')
 RETURNING p.*
)
INSERT INTO public.treatment_plans(id,patient_id,plan,risk,created_at,confirmed_at,confirmed_by)
SELECT md5('demo-complete-current-'||id)::uuid,id,ai_plan,cognitive_risk,ai_plan_at,ai_plan_confirmed_at,ai_plan_confirmed_by FROM filled
ON CONFLICT DO NOTHING;

-- Supply saved home/lifestyle content where older demo plans omitted a group.
UPDATE public.patients p SET ai_plan=jsonb_set(p.ai_plan,'{training}',coalesce(p.ai_plan->'training','[]') || jsonb_build_array(
 jsonb_build_object('domain','执行功能','activity','物品回忆、日历待办、模拟购物：家属陪伴选择两项练习，记录完成情况。','frequency','每周1-2次','duration','每次20-30分钟','setting','家庭作业')))
WHERE ai_plan IS NOT NULL AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(ai_plan->'training','[]')) x WHERE x->>'setting' IN ('家庭作业','家庭任务','居家','家庭'))
AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements_text(coalesce(ai_plan->'followup'->'items','[]')) x WHERE x LIKE '%家庭作业%');

INSERT INTO public.treatment_plans(id,patient_id,plan,risk,created_at,confirmed_at,confirmed_by)
SELECT md5('demo-complete-history-'||p.id)::uuid,p.id,p.ai_plan,p.cognitive_risk,'2026-11-01T09:00:00+08:00','2026-11-01T10:00:00+08:00','鼓楼医院记忆门诊'
FROM public.patients p WHERE p.ai_plan IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.treatment_plans h WHERE h.patient_id=p.id AND h.created_at < p.ai_plan_at - interval '5 seconds')
ON CONFLICT DO NOTHING;

INSERT INTO public.training_records(id,patient_id,trained_on,training_time,domain,activity,setting,duration_min,completion,operator,feedback,record_type)
SELECT md5('demo-complete-station-'||p.id||s.n)::uuid,p.id,s.day::date,s.clock::time,s.domain,s.activity,s.setting,s.minutes,'完成','小市社区康复治疗师',s.feedback,s.kind
FROM public.patients p CROSS JOIN (VALUES
 ('1','2026-11-19','09:10','记忆','图片配对','认知训练设备',20,'难度 L1；完成3/4关，正确率75%。','设备训练'),
 ('2','2026-11-20','09:30','注意力','数字搜索','认知训练设备',20,'难度 L2；完成4/5关，正确率80%。','设备训练'),
 ('3','2026-11-19','10:10','记忆','生活物品回忆','站内小组',25,'完成3轮物品回忆，末轮需一次提示。','非设备干预'),
 ('4','2026-11-20','10:20','执行功能','日历待办与模拟购物','站内个训',25,'核对日期并完成购物清单，计算时给予口头提示。','非设备干预')
) s(n,day,clock,domain,activity,setting,minutes,feedback,kind)
WHERE p.ai_plan IS NOT NULL AND p.ai_plan_confirmed_at >= p.ai_plan_at
ON CONFLICT DO NOTHING;

INSERT INTO public.family_task_checkins(id,patient_id,plan_version,task_key,category,title,recorded_on,duration_min,note,recorded_by,created_at)
SELECT md5('demo-complete-family-'||p.id||s.day)::uuid,p.id,p.ai_plan_at::text,t.key,'训练',t.title,s.day::date,s.minutes,s.note,s.performer,s.at::timestamptz
FROM public.patients p CROSS JOIN LATERAL (
 SELECT 'training-'||(x.ordinality-1)::text AS key,x.value->>'activity' AS title
 FROM jsonb_array_elements(coalesce(p.ai_plan->'training','[]')) WITH ORDINALITY x
 WHERE x.value->>'setting' IN ('家庭作业','家庭任务','居家','家庭')
 UNION ALL SELECT 'followup-'||(x.ordinality-1)::text,x.value
 FROM jsonb_array_elements_text(coalesce(p.ai_plan->'followup'->'items','[]')) WITH ORDINALITY x
 WHERE coalesce(jsonb_array_length(p.ai_plan->'interventions'),0)=0 AND x.value LIKE '%家庭作业%' AND x.value !~ '用药|服药|降压药|助眠药'
 LIMIT 1
) t CROSS JOIN (VALUES
 ('2026-11-18',20,'完成物品回忆与日历待办；难度：L1；训练时间：18:30。','家属协助','2026-11-18T19:00:00+08:00'),
 ('2026-11-19',25,'完成记忆配对与模拟购物；难度：L2；训练时间：18:40。','本人','2026-11-19T19:10:00+08:00'),
 ('2026-11-20',20,'完成物品回忆与数字排序；难度：L1；训练时间：08:30。','家属协助','2026-11-20T09:00:00+08:00')
) s(day,minutes,note,performer,at)
WHERE p.ai_plan IS NOT NULL AND p.ai_plan_confirmed_at >= p.ai_plan_at
ON CONFLICT DO NOTHING;

UPDATE public.family_task_checkins SET note=coalesce(note,'完成居家认知练习。')||'；难度：L1；训练时间：18:30'
WHERE category='训练' AND id IN (
 SELECT md5('family-source-'||p.id||'-'||s.day)::uuid FROM public.patients p CROSS JOIN (VALUES ('2026-11-19'),('2026-11-20')) s(day)
) AND coalesce(note,'') NOT LIKE '%难度%';