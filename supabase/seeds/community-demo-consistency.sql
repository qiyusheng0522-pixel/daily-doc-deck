-- 清理显眼演示标记并关闭已完成初筛者残留的申请；不删除任何已保存量表或方案。
begin;
update public.nurse_tasks set status='已完成'
where title='AD-8 初筛评估申请' and status='待执行'
  and exists (select 1 from public.patients p where p.id=patient_id and p.ad8 is not null);
update public.patients set
  name=regexp_replace(name,'[（(][^）)]*(示例|演示)[^）)]*[）)]','','g'),
  diagnosis=case when diagnosis in ('认知健康流程演示（非诊断）','待评估（示例）') then '认知健康评估' when diagnosis='训练排期示例（非诊断）' then '社区认知健康训练' else regexp_replace(diagnosis,'[（(][^）)]*(示例|演示)[^）)]*[）)]','','g') end,
  condition_summary=case when id::text like 'c0120000-%' then case when ad8 is null then '待初筛' when ad8<2 then '初筛阴性' else coalesce(cognitive_risk,'阳性待进一步评估') end||'，按社区认知健康流程处理。' else condition_summary end
where name ~ '示例|演示' or diagnosis ~ '示例|演示' or id::text like 'c0120000-%';
update public.scale_assessments set assessed_by=trim(regexp_replace(regexp_replace(assessed_by,'[（(][^）)]*(示例|演示)[^）)]*[）)]','','g'),'[ ·]*(示例|演示)[^ ·]*','','g')) where assessed_by ~ '示例|演示';
update public.nurse_tasks set title=regexp_replace(title,'[（(][^）)]*(示例|演示)[^）)]*[）)]','','g'),due_text=regexp_replace(due_text,'[（(][^）)]*(示例|演示)[^）)]*[）)]','','g') where title ~ '示例|演示' or due_text ~ '示例|演示';
update public.followups set item=regexp_replace(item,'[（(][^）)]*(示例|演示)[^）)]*[）)]','','g'),note=replace(note,'工作台待随访示例','认知健康随访') where item ~ '示例|演示' or note='工作台待随访示例';
update public.patients set ai_plan=jsonb_set(ai_plan,'{summary}','"按已确认方案进行社区训练。"'),ai_plan_confirmed_by=replace(ai_plan_confirmed_by,'（演示确认）','') where id='c0110000-0000-4000-8000-000000000005' and ai_plan->>'summary' like '%工作台今日训练示例%';
update public.treatment_plans set plan=jsonb_set(plan,'{summary}','"按已确认方案进行社区训练。"'),confirmed_by=replace(confirmed_by,'（演示确认）','') where patient_id='c0110000-0000-4000-8000-000000000005' and plan->>'summary' like '%工作台今日训练示例%';
update public.referrals set reason='社区承接，按指导意见落实后续服务' where id='c0110000-0000-4000-8000-000000000006' and reason like '%示例%';
-- 精确去除旧演示历史中的括号标记，保留答卷、证据、日期、审批与方案内容。
update public.patients set ai_plan=replace(ai_plan::text,'（示例）','')::jsonb,ai_risk=replace(ai_risk::text,'（示例）','')::jsonb,past_history=replace(past_history,'（示例）',''),medications=replace(medications,'（示例）',''),family_history=replace(family_history,'（示例）',''),condition_summary=replace(condition_summary,'（示例）',''),ai_plan_confirmed_by=replace(ai_plan_confirmed_by,'（示例）','') where to_jsonb(patients)::text like '%（示例）%';
update public.treatment_plans set plan=replace(plan::text,'（示例）','')::jsonb,confirmed_by=replace(confirmed_by,'（示例）','') where to_jsonb(treatment_plans)::text like '%（示例）%';
update public.patient_documents set title=replace(title,'（示例）',''),extracted_text=replace(extracted_text,'（示例）',''),uploaded_by=replace(uploaded_by,'（示例）','') where to_jsonb(patient_documents)::text like '%（示例）%';
update public.training_records set activity=replace(activity,'（示例）',''),feedback=replace(feedback,'（示例）',''),operator=replace(operator,'（示例）','') where to_jsonb(training_records)::text like '%（示例）%';
commit;