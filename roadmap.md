# Roadmap — one shared real database (stroke pathway)

Goal: one stroke cohort, one set of pathway records, all four ends read the same data.
Purpose: stakeholder demo.

## Done
- [x] Surveyed current state: 3 disjoint cohorts, empty backend, education/followup still diabetes/thyroid.
- [x] Migration: role infra (user_roles + has_role), extend patients with pathway columns, create pathway tables + grants + RLS.
- [x] Create demo auth user, seed profiles + 4 roles.
- [x] Seed one stroke cohort (9 patients) + plans, reviews, tasks, education, referrals, followups, uploads, messages, checkins.
- [x] Query layer: src/data/patients.ts hooks replacing mock imports.
- [x] Wire doctor end: DoctorHome, DoctorPatients (plans/reviews already read shared layer).
- [x] Wire nurse end: NurseHome, NursePatients, NurseHandover — 出院下转 now writes a real referral.
- [x] Wire community end: CommunityHome, CommunityPatients — 新接收 lists pending referrals, 接收 writes back; upload-to-Gulou writes.
- [x] Followup screen reads shared followups (nurse + community).
- [x] Flow test: nurse 出院下转 → community 新接收 → 接收 verified in browser + database.

## Open
- [ ] Wire remaining detail screens still on mock data: DoctorPatientDetail, DoctorPlans, NursePatientDetail, NurseEducation, CommunityPatientDetail, CommunityEducation.
- [ ] Wire patient end: PatientHome, PatientPlan, PatientTasks, PatientRisk, PatientArchive, PatientDataEntry.
- [ ] Replace diabetes/thyroid education + followup sample content (src/data/education.ts, followup.ts) with stroke content.
- [ ] Community 上传 → doctor sees it: doctor-side inbox for uploads not yet built.
- [ ] Add a rule test for the referral/receive transition next to existing tests.

## Notes
- Demo account holds all four roles so one person can click every end; real per-role accounts are a later step.
- 新接收 tab = 待接收 referrals + patients already at 新接收 stage; 接收 sets referral 已接收 and patient community_stage 新接收.
