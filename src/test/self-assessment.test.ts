import { describe, it, expect } from "vitest";
import { SELF_QUESTIONNAIRES, questionnaireTotal, latestSelfAssessments, selfAssessmentConcerns } from "../../supabase/functions/_shared/selfAssessment";
describe("方案自评依据", () => {
  it("已填两份与未填两份并存，保留问题项和逐题详情数据", () => {
    const records = [
      { scale: "self_sleep", items: { s1: 2, s2: 2, s3: 1, s4: 1, s5: 0, s6: 0, s7: 0, s8: 0, s9: 0, s10: 0, s11: 0, s12: 0, s13: 0, s14: 0, s15: 0, s16: 0, s17: 0 }, total: 5, created_at: "2026-11-17", assessed_by: "患者填写 · 示例" },
      { scale: "self_nutrition", items: { n1: 1, n2: 2, n3: 2, n4: 1, n5: 1, n6: 2 }, total: 9, created_at: "2026-11-17", assessed_by: "患者填写 · 示例" },
    ];
    const results = latestSelfAssessments(records);
    expect(results.filter(x => x.record).map(x => x.questionnaire.id)).toEqual(["sleep", "nutrition"]);
    expect(results.filter(x => !x.record).map(x => x.questionnaire.id)).toEqual(["fall", "anxiety", "depression"]);
    expect(selfAssessmentConcerns(results[0].questionnaire, results[0].record?.items)[0].answer).toBe("较差");
  });
  it("没有数据时五份均缺失，不默认正常", () => expect(latestSelfAssessments([]).filter(x => !x.record)).toHaveLength(5));
  it("未完成逐题作答不能评分", () => expect(questionnaireTotal(SELF_QUESTIONNAIRES[0], {})).toBeNull());
  it("完整答案支持零分", () => {
    const q = SELF_QUESTIONNAIRES[0];
    const items = Object.fromEntries(q.questions.map(x => [x.id, 0]));
    expect(questionnaireTotal(q, items)).toBe(0);
    expect(latestSelfAssessments([{ scale: "self_sleep", items, total: 0, created_at: "2026-11-19", assessed_by: "医生协助患者" }])[0].record?.total).toBe(0);
  });
  it("无逐题答案的旧分数不视为完成", () => expect(latestSelfAssessments([{ scale: "self_sleep", items: {}, total: 0, created_at: "2026-11-19", assessed_by: null }])[0].record).toBeUndefined());
  it("睡眠质量很差提取问题项", () => expect(selfAssessmentConcerns(SELF_QUESTIONNAIRES[0], { s1: 3 })).toEqual([{ id: "s1", question: "近一个月总的来说您认为自己的睡眠质量", answer: "很差" }]));
  it("营养分数方向相反，明显食量减少为问题而没有减少不是问题", () => {
    expect(selfAssessmentConcerns(SELF_QUESTIONNAIRES[1], { n1: 0 })).toHaveLength(1);
    expect(selfAssessmentConcerns(SELF_QUESTIONNAIRES[1], { n1: 2 })).toHaveLength(0);
  });
});
describe("文档量表计分", () => {
  const q = (id: string) => SELF_QUESTIONNAIRES.find(x => x.id === id)!;
  it("PSQI 按七成分累计：入睡16-30分钟且<1次/周入睡困难记1分", () => {
    const a = Object.fromEntries(q("sleep").questions.map(x => [x.id, 0])); a.s2 = 1; a.s3 = 1;
    expect(questionnaireTotal(q("sleep"), a)).toBe(1);
  });
  it("SAS 标准分=粗分×1.25取整，全部最轻为25分", () => {
    const a = Object.fromEntries(q("anxiety").questions.map(x => [x.id, Math.min(...x.options.map(o => o.score))]));
    expect(questionnaireTotal(q("anxiety"), a)).toBe(25);
  });
  it("SDS 第2题反向计分：选“持续”记1分", () => expect(q("depression").questions[1].options.find(o => o.label === "持续")?.score).toBe(1));
  it("Morse 扶家具行走记30分", () => expect(q("fall").questions[2].options.at(-1)?.score).toBe(30));
});
