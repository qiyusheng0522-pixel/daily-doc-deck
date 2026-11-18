ALTER TYPE public.patient_source ADD VALUE IF NOT EXISTS '小市社区';
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS ad8 integer,
  ADD COLUMN IF NOT EXISTS mmse integer,
  ADD COLUMN IF NOT EXISTS moca integer,
  ADD COLUMN IF NOT EXISTS scd_q9 integer,
  ADD COLUMN IF NOT EXISTS adl integer,
  ADD COLUMN IF NOT EXISTS cognitive_risk text,
  ADD COLUMN IF NOT EXISTS cognitive_diagnosis text,
  ADD COLUMN IF NOT EXISTS next_reassess text,
  ADD COLUMN IF NOT EXISTS caregiver text;
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS direction text NOT NULL DEFAULT '下转';
ALTER TABLE public.referrals ALTER COLUMN to_community SET DEFAULT '小市社区';
COMMENT ON COLUMN public.patients.nihss IS 'DEPRECATED: replaced by cognitive scale columns';
COMMENT ON COLUMN public.patients.stroke_type IS 'DEPRECATED: replaced by cognitive_diagnosis';