CREATE TABLE public.screenings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender text NOT NULL DEFAULT '男',
  age integer NOT NULL,
  phone text,
  exam_date date NOT NULL DEFAULT current_date,
  ad8 integer NOT NULL,
  status text NOT NULL DEFAULT '待核对',
  verified_by text,
  refer_to text,
  appointment_at timestamptz,
  note text,
  patient_id uuid REFERENCES public.patients(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.screenings TO authenticated;
GRANT ALL ON public.screenings TO service_role;
ALTER TABLE public.screenings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read screenings" ON public.screenings FOR SELECT TO authenticated USING (public.is_program_member());
CREATE POLICY "members insert screenings" ON public.screenings FOR INSERT TO authenticated WITH CHECK (public.is_program_member());
CREATE POLICY "members update screenings" ON public.screenings FOR UPDATE TO authenticated USING (public.is_program_member()) WITH CHECK (public.is_program_member());
CREATE TRIGGER screenings_updated BEFORE UPDATE ON public.screenings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();