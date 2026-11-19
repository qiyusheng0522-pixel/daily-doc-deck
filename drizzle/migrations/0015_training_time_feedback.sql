ALTER TABLE public.training_records ADD COLUMN IF NOT EXISTS training_time time, ADD COLUMN IF NOT EXISTS feedback text;
COMMENT ON COLUMN public.training_records.training_time IS 'Local clock time of a training session; historical sessions may have no time recorded';
COMMENT ON COLUMN public.training_records.feedback IS 'Execution feedback recorded by the community training operator';