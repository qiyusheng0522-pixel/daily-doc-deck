import { describe, it, expect } from "vitest";
import { SELF_QUESTIONNAIRES, questionnaireTotal, latestSelfAssessments, latestDoctorAssessments } from "../../supabase/functions/_shared/selfAssessment";
describe("方案自评依据", () => {
  it("治疗方案的他评依据选取各量表最新逐题评分，排除自评与空记录", () => {
    const records = [
      { scale: "mmse", items: { "即刻记忆": 2 }, total: 22, created_at: "2026-11-19", assessed_by: "评估医生" },
      { scale: "mmse", items: { "即刻记忆": 1 }, total: 20, created_at: "2026-11-18", assessed_by: "评估医生" },
      { scale: "moca", items: {}, total: 0, created_at: "2026-11-19", assessed_by: "评估医生" },
      { scale: "self_sleep", items: { s1: 1 }, total: 1, created_at: "2026-11-19", assessed_by: "本人" },
    ];
    expect(latestDoctorAssessments(records).map(r => [r.scale, r.total])).toEqual([["mmse", 22]]);
    expect(latestDoctorAssessments([])).toEqual([]);
  });
  it("没有数据时四份均缺失，不默认正常", () => expect(latestSelfAssessments([]).filter(x => !x.record)).toHaveLength(4));
  it("未完成逐题作答不能评分", () => expect(questionnaireTotal(SELF_QUESTIONNAIRES[0], {})).toBeNull());
  it("完整答案支持零分", () => {
    const q = SELF_QUESTIONNAIRES[0];
    const items = Object.fromEntries(q.questions.map(x => [x.id, 0]));
    expect(questionnaireTotal(q, items)).toBe(0);
    expect(latestSelfAssessments([{ scale: "self_sleep", items, total: 0, created_at: "2026-11-19", assessed_by: "医生协助患者" }])[0].record?.total).toBe(0);
  });
  it("无逐题答案的旧分数不视为完成", () => expect(latestSelfAssessments([{ scale: "self_sleep", items: {}, total: 0, created_at: "2026-11-19", assessed_by: null }])[0].record).toBeUndefined());
});