import { describe, it, expect } from "vitest";
import { SELF_QUESTIONNAIRES, questionnaireTotal, latestSelfAssessments, selfAssessmentConcerns } from "../../supabase/functions/_shared/selfAssessment";
describe("方案自评依据", () => {
  it("没有数据时四份均缺失，不默认正常", () => expect(latestSelfAssessments([]).filter(x => !x.record)).toHaveLength(4));
  it("未完成逐题作答不能评分", () => expect(questionnaireTotal(SELF_QUESTIONNAIRES[0], {})).toBeNull());
  it("完整答案支持零分", () => {
    const q = SELF_QUESTIONNAIRES[0];
    const items = Object.fromEntries(q.questions.map(x => [x.id, 0]));
    expect(questionnaireTotal(q, items)).toBe(0);
    expect(latestSelfAssessments([{ scale: "self_sleep", items, total: 0, created_at: "2026-11-19", assessed_by: "医生协助患者" }])[0].record?.total).toBe(0);
  });
  it("无逐题答案的旧分数不视为完成", () => expect(latestSelfAssessments([{ scale: "self_sleep", items: {}, total: 0, created_at: "2026-11-19", assessed_by: null }])[0].record).toBeUndefined());
  it("睡眠入睡超过1小时提取问题标签", () => expect(selfAssessmentConcerns(SELF_QUESTIONNAIRES[0], { s1: 3 })).toEqual([{ id: "s1", question: "上床后多久能入睡？", answer: "超过 1 小时" }]));
  it("营养分数方向相反，明显食量减少为问题而没有减少不是问题", () => {
    expect(selfAssessmentConcerns(SELF_QUESTIONNAIRES[1], { n1: 0 })).toHaveLength(1);
    expect(selfAssessmentConcerns(SELF_QUESTIONNAIRES[1], { n1: 2 })).toHaveLength(0);
  });
});