-- Additive source histories for existing confirmed-plan patients; no plan/assessment changes.
INSERT INTO public.training_records(id,patient_id,trained_on,training_time,domain,activity,setting,duration_min,completion,operator,feedback,record_type)
SELECT md5('station-source-' || p.id::text || '-' || s.n)::uuid,p.id,s.day::date,s.time::time,
 p.ai_plan->'training'->s.idx->>'domain',p.ai_plan->'training'->s.idx->>'activity','站内小组',s.minutes,s.completion,'小市社区康复治疗师',s.feedback,s.kind
FROM public.patients p CROSS JOIN (VALUES
 ('1','2026-11-19','09:10',0,25,'完成','完成物品回忆3轮，最后一轮需一次提示。','非设备干预'),
 ('2','2026-11-19','10:20',1,20,'部分完成','完成数字搜索2轮，疲劳后休息。','非设备干预'),
 ('3','2026-11-20','09:00',2,25,'完成','完成模拟购物，计算找零时需口头提示。','非设备干预'),
 ('4','2026-11-20','10:00',4,20,'完成','图形拼合完成3/4关；正确率75%。','设备训练')
) s(n,day,time,idx,minutes,completion,feedback,kind)
WHERE p.id IN ('b73c3061-eab5-4ab0-a106-4225bbdf512a','1aac77e1-8be7-4547-85f0-7b88e790c821')
AND p.ai_plan_confirmed_at >= p.ai_plan_at AND p.ai_plan->'training'->s.idx IS NOT NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.family_task_checkins(id,patient_id,plan_version,task_key,category,title,recorded_on,duration_min,note,recorded_by,created_at)
SELECT md5('family-source-' || p.id::text || '-' || s.day)::uuid,p.id,p.ai_plan_at::text,'followup-1','训练',
 p.ai_plan->'followup'->'items'->>1,s.day::date,s.minutes,s.note,s.by,s.at::timestamptz
FROM public.patients p CROSS JOIN (VALUES
 ('2026-11-19',20,'物品回忆完成3轮，日历待办已核对；家属给予一次提示。','家属协助','2026-11-19T19:30:00+08:00'),
 ('2026-11-20',20,'完成记忆配对及模拟购物，练习间歇休息，未出现不适。','本人','2026-11-20T10:10:00+08:00')
) s(day,minutes,note,by,at)
WHERE p.id IN ('b73c3061-eab5-4ab0-a106-4225bbdf512a','1aac77e1-8be7-4547-85f0-7b88e790c821')
AND p.ai_plan_confirmed_at >= p.ai_plan_at
AND coalesce(jsonb_array_length(p.ai_plan->'interventions'),0)=0
AND p.ai_plan->'followup'->'items'->>1 LIKE '%家庭作业%'
ON CONFLICT DO NOTHING;
