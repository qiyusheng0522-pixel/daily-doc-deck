<!-- AGENT-MEMORY:BEGIN -->
- Keep provincial dashboard presentation and demo analytics in dedicated screen modules; derive map, trends and drilldown rows from the same selected region to prevent inconsistent interactions.
- All four ends read one shared database via hooks in src/data/patients.ts; never add per-page hardcoded patient lists (ends must show the same people).
- patients.hospital_stage is the nurse/assessor stage and community_stage the training-station stage; one row per person carries both so one record flows across ends.
- referrals.direction ('上转'/'下转') distinguishes station→center vs center→station in one table, so both flows share receive/list logic.
- Stroke-era columns (nihss, mrs, limb_power, stroke_type) are deprecated, not dropped, to avoid breaking migrations.
- AI calls run only in the `cognitive-advice` backend function via @lovable.dev/ai-gateway with strict JSON schema; the client never calls models directly, keeping keys and prompts server-side.
- Screening-center records live in `screenings` (separate from patients; optional patient_id link) so intake data can later sync from the physical-exam system.
- Model-generated rehab plans are saved to patients.ai_plan by the cognitive-advice function so doctor, community and family ends show the same plan.
- Training sessions live in `training_records` (one row per session) so all ends share history; doctor confirmation of model plans is stored on patients (ai_plan_confirmed_at/by).
- Plan history lives in `treatment_plans` (one row per generation); PlanView/PlanReview are the single plan renderers so patient detail and doctor review stay identical. Exam photos go to private bucket `patient-docs` + `patient_documents`.
- Generate and confirm doctor treatment plans only in the plan-review screen; patient files use history-only PlanReview so review actions are not duplicated. Shared treatment service parameters live in functions/_shared/treatment.ts for generator and review consistency.
- Family self-assessments and doctor-assisted questionnaires share SelfAssessmentForm and functions/_shared/selfAssessment.ts; persist item answers as self_* scale_assessments and require all four saved questionnaires before AI generation to avoid treating missing results as normal.
- Plan generation also reads saved doctor item scores; hospital edits use authenticated cognitive-advice edit mode, retain immutable prior versions and clear confirmation so downstream users never execute an unconfirmed revision. SelfAssessmentResults renders shared question-label results across patient detail views.
- Scale items/maxima live in src/data/scales.ts; each completed scale is a `scale_assessments` row and also updates the patient column. Model risk analysis is the `mode: "risk"` branch of cognitive-advice, saved to patients.ai_risk; doctor adoption sets cognitive_risk.
- DemoSession (mounted in App) auto-signs in the demo account when signed out, so stakeholder demos never hit RLS write failures; all ends share that multi-role account.
<!-- AGENT-MEMORY:END -->
