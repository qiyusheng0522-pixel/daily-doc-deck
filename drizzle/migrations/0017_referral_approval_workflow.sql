ALTER TABLE public.referrals ADD COLUMN approval_status text CHECK (approval_status IN ('待审批','已转出','已退回')), ADD COLUMN approval_note text, ADD COLUMN approved_at timestamptz, ADD COLUMN approved_by uuid;
CREATE OR REPLACE FUNCTION public.request_upward_referral(_patient_id uuid, _reason text, _dept text, _doctor_name text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.patients%ROWTYPE; rid uuid;
BEGIN
 IF NOT (public.has_role(auth.uid(),'community') OR public.has_role(auth.uid(),'doctor')) THEN RAISE EXCEPTION '无权提交社区转诊申请'; END IF;
 SELECT * INTO p FROM public.patients WHERE id=_patient_id FOR UPDATE;
 IF NOT FOUND OR p.cognitive_risk IS NULL OR p.cognitive_risk NOT IN ('中风险','高风险') THEN RAISE EXCEPTION '仅评估确定的中高风险患者可申请转诊'; END IF;
 IF EXISTS (SELECT 1 FROM public.referrals WHERE patient_id=_patient_id AND direction='上转' AND (approval_status='待审批' OR (approval_status='已转出' AND status='待接收'))) THEN RAISE EXCEPTION '该患者已有处理中转诊申请'; END IF;
 IF coalesce(trim(_dept),'')='' OR coalesce(trim(_doctor_name),'')='' THEN RAISE EXCEPTION '请选择门诊和医生'; END IF;
 INSERT INTO public.referrals(patient_id,from_hospital,to_community,reason,direction,status,dept,doctor_name,approval_status) VALUES (_patient_id,'小市社区','南京市鼓楼医院',left(_reason,1000),'上转','待接收',_dept,_doctor_name,'待审批') RETURNING id INTO rid;
 RETURN rid;
END $$;
CREATE OR REPLACE FUNCTION public.review_upward_referral(_referral_id uuid, _approve boolean, _note text, _dept text, _doctor_name text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.referrals%ROWTYPE;
BEGIN
 IF NOT public.has_role(auth.uid(),'doctor') THEN RAISE EXCEPTION '只有评估医生可以审批转诊'; END IF;
 SELECT * INTO r FROM public.referrals WHERE id=_referral_id FOR UPDATE;
 IF NOT FOUND OR r.direction<>'上转' OR r.approval_status IS DISTINCT FROM '待审批' THEN RAISE EXCEPTION '转诊申请状态已更新'; END IF;
 IF coalesce(trim(_note),'')='' THEN RAISE EXCEPTION '请填写审批意见'; END IF;
 IF _approve AND (coalesce(trim(_dept),'')='' OR coalesce(trim(_doctor_name),'')='') THEN RAISE EXCEPTION '请选择上级医院门诊和医生'; END IF;
 UPDATE public.referrals SET approval_status=CASE WHEN _approve THEN '已转出' ELSE '已退回' END, approval_note=left(trim(_note),1000), approved_at=clock_timestamp(), approved_by=auth.uid(), dept=CASE WHEN _approve THEN _dept ELSE dept END, doctor_name=CASE WHEN _approve THEN _doctor_name ELSE doctor_name END WHERE id=_referral_id;
END $$;
REVOKE ALL ON FUNCTION public.request_upward_referral(uuid,text,text,text), public.review_upward_referral(uuid,boolean,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_upward_referral(uuid,text,text,text), public.review_upward_referral(uuid,boolean,text,text,text) TO authenticated;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='referrals') THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals; END IF; END $$;