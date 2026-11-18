<!-- AGENT-MEMORY:BEGIN -->
- All four ends read one shared database via hooks in src/data/patients.ts; never add per-page hardcoded patient lists (ends must show the same people).
- patients.hospital_stage is the nurse/assessor stage and community_stage the training-station stage; one row per person carries both so one record flows across ends.
- referrals.direction ('上转'/'下转') distinguishes station→center vs center→station in one table, so both flows share receive/list logic.
- Stroke-era columns (nihss, mrs, limb_power, stroke_type) are deprecated, not dropped, to avoid breaking migrations.
- AI calls run only in the `cognitive-advice` backend function via @lovable.dev/ai-gateway with strict JSON schema; the client never calls models directly, keeping keys and prompts server-side.
- Screening-center records live in `screenings` (separate from patients; optional patient_id link) so intake data can later sync from the physical-exam system.
<!-- AGENT-MEMORY:END -->
