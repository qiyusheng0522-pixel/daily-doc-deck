import { describe, expect, it } from "vitest";
import { TREATMENT_PROTOCOL } from "../../supabase/functions/_shared/treatment";

describe("医生治疗服务参数", () => {
  const mid = TREATMENT_PROTOCOL.中风险;
  it("中风险每周训练1-3次", () => expect(mid.training.weekly).toEqual([1, 3]));
  it("每次训练20-30分钟", () => expect(mid.training.minutes).toEqual([20, 30]));
  it("每期累计20-36小时", () => expect(mid.training.courseHours).toEqual([20, 36]));
  it("小组6-12人", () => expect(mid.training.groupSize).toEqual([6, 12]));
  it("家庭作业每周1-2次", () => expect(mid.homework.weekly).toEqual([1, 2]));
  it("家庭作业每次20-30分钟", () => expect(mid.homework.minutes).toEqual([20, 30]));
  it("中风险同时包含非药物干预和睡眠营养心理管理", () => expect(mid.categories).toEqual(["认知训练", "其他非药物干预", "家庭作业", "风险因素管理", "睡眠", "营养", "心理"]));
  it("高风险涵盖长期护理、家庭病床、上门康复及风险管理", () => expect(TREATMENT_PROTOCOL.高风险.categories).toEqual(["长期护理或家庭病床服务", "家庭病床准入评估", "上门评估与康复干预", "风险因素管理"]));
  it("家庭病床必须先评估准入", () => expect(TREATMENT_PROTOCOL.高风险.requiresAdmissionAssessment).toBe(true));
});