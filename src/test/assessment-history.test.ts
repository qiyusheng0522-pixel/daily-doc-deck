import { describe, expect, it } from "vitest";
import { assessmentHistory } from "@/data/assessmentHistory";

describe("全部历史量表", () => {
  it("保留同一量表的每次他评和自评，不仅返回最新记录", () => {
    const records = ["mmse", "mmse", "moca", "scd_q9", "adl", "self_sleep", "self_nutrition"].map((scale, i) => ({ id: String(i), scale, items: {}, total: i, created_at: `2026-11-${10 + i}`, assessed_by: "评估医生" }));
    expect(assessmentHistory(records).map(r => r.id)).toEqual(["6", "5", "4", "3", "2", "1", "0"]);
  });
  it("历史自评作答按保存的分值还原为问题和选项", () => {
    const [record] = assessmentHistory([{ id: "1", scale: "self_sleep", items: { s1: 3 }, total: 3, created_at: "2026-11-19", assessed_by: "患者" }]);
    expect(record.answers).toEqual([{ question: "近一个月总的来说您认为自己的睡眠质量", group: "睡眠质量", answer: "很差", score: 3 }]);
  });
  it("他评逐项按文档选项文字还原", () => {
    const [record] = assessmentHistory([{ id: "1", scale: "adl", items: { 进食: 5 }, total: 5, created_at: "2026-11-19", assessed_by: "医生" }]);
    expect(record.answers[0].answer).toBe("需部分帮助");
  });
});