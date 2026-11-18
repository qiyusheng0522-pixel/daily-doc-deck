ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_hospital_stage_check;
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_community_stage_check;
ALTER TABLE public.patients ADD CONSTRAINT patients_hospital_stage_check CHECK (hospital_stage IS NULL OR hospital_stage IN ('待入院','院中','待出院','历史','待评估','评估中','待转诊')) NOT VALID;
ALTER TABLE public.patients ADD CONSTRAINT patients_community_stage_check CHECK (community_stage IS NULL OR community_stage IN ('新接收','随访中','复诊待约','历史','干预中','待复评')) NOT VALID;