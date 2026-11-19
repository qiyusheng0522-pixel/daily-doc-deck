ALTER TABLE public.patient_documents ADD COLUMN IF NOT EXISTS extracted_text text;
ALTER TABLE public.patient_documents ADD COLUMN IF NOT EXISTS title text;