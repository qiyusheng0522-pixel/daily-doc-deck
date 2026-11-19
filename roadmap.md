# Roadmap — 老年认知训练站系统（由卒中系统转型）

Source docs: 江苏省《老年认知训练站建设基本标准》《实施方案》、流程图11-13.ppt。
Roles: doctor=上级指导中心(鼓楼记忆门诊), nurse=评估师/治疗管理师, community=小市社区认知训练站, patient=老人及家属.

## Done
- [x] Schema: cognitive scale columns, risk level, 小市社区 source, referral direction (上转/下转), new stage values.
- [x] Reseed 9 patients, education, referrals, tasks, followups, messages with cognitive content.
- [x] Data layer types updated.

- [x] Stroke wording replaced across all pages; site title/description updated.
- [x] Shared cognitive detail page for doctor/nurse/community: scales, risk plan, 8 domains, referrals, 上转/下转 actions.
- [x] Doctor home shows 上转待确诊 queue; community only receives 下转.
- [x] Rule tests: AD-8 ≥2 positive; reassess 1y/6m/3m. Verified nurse 上转 → doctor queue in browser.

## Open
- [x] Current request: always expose current-plan editing; history lists dates only and opens read-only details in the same in-frame sheet as assisted self-assessment. Editor input and history open/close verified in preview; 13 treatment tests passed.
- [x] Current request: mixed completed/missing self-assessment examples with labels/details; rename doctor training history and seed shared training/treatment history examples. Verified self details, three completion states and expandable treatment history in preview.
- [x] Doctor review: editable treatment categories and concrete training, generation reads doctor + self-assessments, self-result tags and detail navigation. Signed-in revision save/readback and self-result detail verified; test data restored. New AI generation prompt deployed but not invoked.
- [x] Link AI plans to saved patient self-assessment questionnaires; doctor-assisted completion and family readback verified with four saved questionnaires. Test answers removed; AI generation itself not invoked.
- [x] Doctor home simplified; mid/high-risk AI treatment confirmation centralized in plans with risk-specific service categories; patient files keep reception and referral/training/plan history. Reception and confirmation verified signed in; new AI output not invoked during verification.
- [x] Provincial screen: reference layout, data hover details, metric/topic drilldowns, map-linked regional trends and detail interactions; verified desktop/mobile and drilldown navigation.
- [ ] Patient end: AD-8 self-test questionnaire, cognitive training check-in (pages still use old structure with replaced wording).
- [ ] Community home: AD-8 screening entry + group training card; doctor stats → 3 quality metrics.
- [ ] Nurse education / handover pages: rework content beyond wording.

## Deferred
- Separate per-role accounts.
