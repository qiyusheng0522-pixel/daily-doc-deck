CREATE TABLE public.training_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  trained_on date NOT NULL DEFAULT current_date,
  domain text NOT NULL,
  activity text NOT NULL,
  setting text NOT NULL DEFAULT '站内小组',
  duration_min integer NOT NULL DEFAULT 30,
  completion text NOT NULL DEFAULT '完成',
  operator text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.training_records TO authenticated;
GRANT SELECT ON public.training_records TO anon;
GRANT ALL ON public.training_records TO service_role;
ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read training" ON public.training_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "demo anon read" ON public.training_records FOR SELECT TO anon USING (true);
CREATE POLICY "members add training" ON public.training_records FOR INSERT TO authenticated WITH CHECK (public.is_program_member());
CREATE POLICY "members edit training" ON public.training_records FOR UPDATE TO authenticated USING (public.is_program_member());
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS ai_plan_confirmed_at timestamptz, ADD COLUMN IF NOT EXISTS ai_plan_confirmed_by text;