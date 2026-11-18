CREATE TABLE public.treatment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  plan jsonb NOT NULL,
  risk text,
  confirmed_at timestamptz,
  confirmed_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.treatment_plans TO anon;
GRANT SELECT, INSERT, UPDATE ON public.treatment_plans TO authenticated;
GRANT ALL ON public.treatment_plans TO service_role;
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo anon read" ON public.treatment_plans FOR SELECT TO anon USING (true);
CREATE POLICY "members read" ON public.treatment_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "members insert" ON public.treatment_plans FOR INSERT TO authenticated WITH CHECK (public.is_program_member());
CREATE POLICY "members update" ON public.treatment_plans FOR UPDATE TO authenticated USING (public.is_program_member());

CREATE TABLE public.patient_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  path text NOT NULL,
  kind text NOT NULL DEFAULT '检查检验',
  uploaded_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.patient_documents TO anon;
GRANT SELECT, INSERT ON public.patient_documents TO authenticated;
GRANT ALL ON public.patient_documents TO service_role;
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo anon read" ON public.patient_documents FOR SELECT TO anon USING (true);
CREATE POLICY "members read" ON public.patient_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "members insert" ON public.patient_documents FOR INSERT TO authenticated WITH CHECK (public.is_program_member());

CREATE POLICY "members read docs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'patient-docs' AND public.is_program_member());
CREATE POLICY "members upload docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'patient-docs' AND public.is_program_member());