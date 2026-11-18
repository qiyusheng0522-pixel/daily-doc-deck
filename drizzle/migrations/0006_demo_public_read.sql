DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['patients','patient_checkins','care_plans','followups','plan_reviews','nurse_tasks','education_items','patient_education','referrals','appointments','screenings'] LOOP
  EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
  EXECUTE format('DROP POLICY IF EXISTS "demo anon read" ON public.%I', t);
  EXECUTE format('CREATE POLICY "demo anon read" ON public.%I FOR SELECT TO anon USING (true)', t);
END LOOP; END $$;
UPDATE public.patients SET community_stage='历史' WHERE id=(SELECT id FROM public.patients WHERE community_stage IS NULL ORDER BY created_at LIMIT 1);