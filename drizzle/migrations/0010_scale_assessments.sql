CREATE TABLE public.scale_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  scale text NOT NULL,
  items jsonb NOT NULL DEFAULT '{}'::jsonb,
  total integer NOT NULL,
  assessed_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.scale_assessments TO anon;
GRANT SELECT, INSERT ON public.scale_assessments TO authenticated;
GRANT ALL ON public.scale_assessments TO service_role;
ALTER TABLE public.scale_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo anon read" ON public.scale_assessments FOR SELECT TO anon USING (true);
CREATE POLICY "members read" ON public.scale_assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "members insert" ON public.scale_assessments FOR INSERT TO authenticated WITH CHECK (public.is_program_member());
ALTER TABLE public.patients ADD COLUMN ai_risk jsonb, ADD COLUMN ai_risk_at timestamptz;