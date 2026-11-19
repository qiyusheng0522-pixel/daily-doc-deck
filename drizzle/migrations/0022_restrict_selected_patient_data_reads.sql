DO $fix$
DECLARE
  target text;
  rule record;
  targets constant text[] := ARRAY['appointments','nurse_tasks','plan_reviews','education_items','treatment_plans','medical_records','scale_assessments','uploads','referrals','followups','patient_documents','screenings','training_records','care_plans','prescriptions','chat_messages','patient_checkins','patients','patient_education'];
BEGIN
  FOREACH target IN ARRAY targets LOOP
    FOR rule IN SELECT policyname, roles FROM pg_policies WHERE schemaname='public' AND tablename=target AND cmd='SELECT' AND qual='true'
    LOOP
      IF 'anon' = ANY(rule.roles) THEN
        EXECUTE format('DROP POLICY %I ON public.%I', rule.policyname, target);
      ELSE
        EXECUTE format('ALTER POLICY %I ON public.%I USING (public.is_program_member())', rule.policyname, target);
      END IF;
    END LOOP;
    -- SELECT also considers permissive ALL policies. A restrictive read guard
    -- prevents unassigned-row write policies from restoring broad read access.
    EXECUTE format('CREATE POLICY selected_program_read_guard ON public.%I AS RESTRICTIVE FOR SELECT TO public USING (public.is_program_member())', target);
    EXECUTE format('REVOKE SELECT ON public.%I FROM anon', target);
  END LOOP;
END
$fix$;