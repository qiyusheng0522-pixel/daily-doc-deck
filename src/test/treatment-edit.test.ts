import { describe, it, expect } from "vitest";
import { editablePlan, planEditError, treatmentCategories } from "@/data/treatmentPlan";
import type { Advice } from "@/components/cognitive/AiAdvicePanel";
const base: Advice = { summary: "个性化方案", focus: [], training: [{ domain: "记忆", activity: "图片回忆：准备三张物品图片，观察后遮盖并回忆，重复三轮", setting: "站内小组", frequency: "每周2次", duration: "每次25分钟" }], followup: { cycle: "每月", reassess: "6个月", items: [] }, caregiver_tips: [], red_flags: [], interventions: [] };
describe("医生修改方案", () => {
  it("未生成方案也能打开全部类型的空白编辑稿，不将服务标准视为个性化方案", () => {
    const draft = editablePlan(null, "中风险");
    expect(draft.interventions).toHaveLength(7);
    expect(draft.training).toHaveLength(1);
    expect(draft.training[0].activity).toBe("");
    expect(planEditError(draft, "中风险")).toBe("请填写方案概要");
  });
  it("中风险所有7类都进入编辑，不修改原方案", () => {
    const draft = editablePlan(base, "中风险");
    expect(draft.interventions?.map(x => x.category)).toEqual(["认知训练", "其他非药物干预", "家庭作业", "风险因素管理", "睡眠", "营养", "心理"]);
    draft.training[0].activity = "医生修订";
    expect(base.training[0].activity).toContain("图片回忆");
  });
  it("高风险4类都可编辑", () => expect(treatmentCategories("高风险")).toEqual(["长期护理或家庭病床服务", "家庭病床准入评估", "上门评估与康复干预", "风险因素管理"]));
  it("缺少具体训练不能保存", () => {
    const draft = editablePlan(base, "中风险");
    draft.interventions = draft.interventions?.map(x => ({ ...x, actions: ["具体措施"], frequency: "每周", duration: "每次20分钟" }));
    expect(planEditError(draft, "中风险")).toBeNull();
    draft.training = [];
    expect(planEditError(draft, "中风险")).toBe("请至少添加一项具体训练");
  });
});