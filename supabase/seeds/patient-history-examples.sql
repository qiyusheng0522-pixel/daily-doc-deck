-- Additive demo history: do not overwrite questionnaires or publish a current plan.
INSERT INTO public.scale_assessments (patient_id, scale, items, total, assessed_by, created_at)
SELECT p.id, s.scale, s.items, s.total, '患者填写 · 示例', '2026-11-17T09:00:00+08:00'::timestamptz
FROM public.patients p
CROSS JOIN (VALUES
  ('self_sleep', '{"s1":2,"s2":1,"s3":2,"s4":1,"s5":0}'::jsonb, 6),
  ('self_nutrition', '{"n1":1,"n2":2,"n3":2,"n4":2,"n5":1}'::jsonb, 8),
  ('self_fall', '{"f1":1,"f2":1,"f3":1,"f4":1,"f5":0}'::jsonb, 4),
  ('self_mental', '{"m1":1,"m2":1,"m3":2,"m4":1,"m5":0}'::jsonb, 5)
) s(scale, items, total)
WHERE ((p.name = '刘美琳' AND s.scale IN ('self_sleep','self_nutrition'))
  OR p.name = '周春华'
  OR (p.name = '赵国强' AND s.scale IN ('self_fall','self_mental')))
AND NOT EXISTS (SELECT 1 FROM public.scale_assessments a WHERE a.patient_id=p.id AND a.scale=s.scale);

INSERT INTO public.training_records (patient_id, trained_on, domain, activity, setting, duration_min, completion, operator)
SELECT p.id, s.day::date, s.domain, s.activity, s.setting, s.minutes, s.completion, '小市社区康复治疗师 · 示例'
FROM public.patients p CROSS JOIN (VALUES
  ('2026-11-16','记忆','图片配对与延迟回忆：6张生活图片观察1分钟，遮盖后回忆，完成3轮。','站内小组',25,'完成'),
  ('2026-11-13','注意力','数字划消：在数字表中圈出指定数字，练习3轮，第二轮需口头提示。','站内个训',20,'部分完成'),
  ('2026-11-10','执行功能','模拟买菜：按购物清单挑选物品并计算总价，家属协助核对。','家庭任务',20,'未完成')
) s(day,domain,activity,setting,minutes,completion)
WHERE p.name IN ('刘美琳','陈慧敏')
AND NOT EXISTS (SELECT 1 FROM public.training_records t WHERE t.patient_id=p.id AND t.operator='小市社区康复治疗师 · 示例' AND t.trained_on=s.day::date);

INSERT INTO public.treatment_plans (patient_id, risk, plan, confirmed_at, confirmed_by, created_at)
SELECT p.id, p.cognitive_risk,
jsonb_build_object(
  'summary',p.name || CASE WHEN v.revision=1 THEN ' · 示例历史方案：认知训练与居家照护初始安排。' ELSE ' · 示例历史方案：根据训练执行情况调整难度，加强睡眠与安全管理。' END,
  'focus',jsonb_build_array('记忆与注意力支持','规律作息','居家安全'),
  'training',jsonb_build_array(
    jsonb_build_object('domain','记忆','activity','生活图片回忆：准备6张物品图片，观察1分钟后遮盖，回忆物品名称；重复3轮。困难时减为4张，表现稳定后增加至8张。家属给予提示，不责备。','frequency','每周2次','duration','每次25分钟','setting','站内小组'),
    jsonb_build_object('domain','注意力','activity','数字划消：准备大字数字表，圈出所有数字3；分3轮，每轮3分钟，轮间休息。困难时减少数字数量，疲劳或不适时停止。','frequency','每周1次','duration','每次20分钟','setting','站内个训'),
    jsonb_build_object('domain','执行功能','activity','生活排序：将洗手、做早餐等4步图片按顺序排列，并复述步骤；完成3组。家属在旁核对，困难时提供首步提示，不操作明火。','frequency','每周1次','duration','每次20分钟','setting','家庭作业')),
  'interventions',CASE WHEN p.cognitive_risk='高风险' THEN jsonb_build_array(
    jsonb_build_object('category','长期护理或家庭病床服务','actions',jsonb_build_array('评估长期照护需求，制定照护分工；家庭病床须先评估准入，不能直接纳入。'),'frequency','持续照护','duration','每3个月复评'),
    jsonb_build_object('category','家庭病床准入评估','actions',jsonb_build_array('核对行动能力、照护者与居家条件，符合准入条件的行动不便对象再办理家庭病床。'),'frequency','服务前评估','duration','按实际评估安排'),
    jsonb_build_object('category','上门评估与康复干预','actions',jsonb_build_array('符合家庭病床准入后，在该框架内安排上门评估、熟悉物品识别及安全活动训练。'),'frequency','按家庭病床服务计划','duration','按耐受情况分段执行'),
    jsonb_build_object('category','风险因素管理','actions',jsonb_build_array('记录血压、用药与跌倒情况，出现异常联系医生。'),'frequency','每日记录','duration','持续执行'))
  ELSE jsonb_build_array(
    jsonb_build_object('category','认知训练','actions',jsonb_build_array('开展图片回忆、数字划消与生活排序训练，6-12人小组，累计20-36小时/期。'),'frequency','每周1-3次','duration','每次20-30分钟'),
    jsonb_build_object('category','其他非药物干预','actions',jsonb_build_array('按兴趣安排怀旧音乐与熟悉生活物品讨论，避免刺激过强。'),'frequency','每周1次','duration','每次20分钟'),
    jsonb_build_object('category','家庭作业','actions',jsonb_build_array('家属协助完成生活排序与物品回忆，记录提示次数。'),'frequency','每周1-2次','duration','每次20-30分钟'),
    jsonb_build_object('category','风险因素管理','actions',jsonb_build_array('记录血压、血糖、用药依从性，异常时联系医生。'),'frequency','每日记录','duration','持续执行'),
    jsonb_build_object('category','睡眠','actions',jsonb_build_array('固定起床时间，记录入睡耗时与夜醒，减少长时间午睡。'),'frequency','每日','duration','连续记录2周'),
    jsonb_build_object('category','营养','actions',jsonb_build_array('记录食量与体重，规律三餐；食量持续下降联系医生。'),'frequency','每周核对','duration','持续执行'),
    jsonb_build_object('category','心理','actions',jsonb_build_array('安排家属陪伴与兴趣活动，记录情绪和社交参与。'),'frequency','每周2次','duration','每次20分钟')) END,
  'followup',jsonb_build_object('cycle','每月1次','reassess',CASE WHEN p.cognitive_risk='高风险' THEN '3个月' ELSE '6个月' END,'items',jsonb_build_array('训练完成与提示次数','睡眠食量和情绪','跌倒及居家安全')),
  'caregiver_tips',jsonb_build_array('使用短句与单步指令，给予充分反应时间。','记录训练完成情况，不强迫疲劳时继续。'),
  'red_flags',jsonb_build_array('急性意识改变或突然出现肢体无力时立即就医。')),
v.confirmed_at, CASE WHEN v.confirmed_at IS NOT NULL THEN '评估医生 · 示例' ELSE NULL END, v.created_at
FROM public.patients p CROSS JOIN (VALUES
  (1,'2026-10-05T09:00:00+08:00'::timestamptz,'2026-10-06T09:00:00+08:00'::timestamptz),
  (2,'2026-11-05T09:00:00+08:00'::timestamptz,NULL::timestamptz)
) v(revision,created_at,confirmed_at)
WHERE p.cognitive_risk IN ('中风险','高风险') AND p.name <> '王建国'
AND NOT EXISTS (SELECT 1 FROM public.treatment_plans t WHERE t.patient_id=p.id AND t.created_at=v.created_at);