import { describe, expect, it } from "vitest";
import { applyRows, planRows, type TableAdvice } from "@/data/planTable";

const base: TableAdvice = { summary: "s", focus: [], followup: { cycle: "", reassess: "", items: [] }, caregiver_tips: [], red_flags: [],
  training: [{ domain: "记忆", activity: "物品回忆", setting: "站内小组", frequency: "每周2次", duration: "30分钟" }],
  interventions: [{ category: "睡眠", actions: ["规律作息"], frequency: "每日", duration: "长期" }] };

describe("plan table", () => {
  it("旧方案展示原有随访中的生活管理和家庭作业，不造新建议", () => {
    const plan = {...base, interventions:undefined, followup:{cycle:"每月",reassess:"6个月",items:["家庭作业：物品回忆，每周1—2次", "每月询问睡眠时长", "核对血压记录"]}};
    const rows = planRows(plan);
    expect(rows.filter(r => r.group === "家庭作业").map(r => r.content)).toEqual(["家庭作业：物品回忆，每周1—2次"]);
    expect(rows.filter(r => r.group === "危险因子与生活方式干预").map(r => r.content)).toEqual(["每月询问睡眠时长", "核对血压记录"]);
    expect(plan.interventions).toBeUndefined();
  });
  it("expands training and interventions into the three groups", () => {
    const rows = planRows(base);
    expect(rows.map(r => r.group)).toEqual(["非药物干预类", "危险因子与生活方式干预"]);
    expect(rows[0].freq).toBe("每周2次，30分钟");
  });
  it("unchecked rows are not sent to execution", () => {
    const rows = planRows(base).map((r, i) => (i === 0 ? { ...r, enabled: false } : r));
    const out = applyRows(base, [...rows, { group: "家庭作业", name: "日常记忆", content: "记录三件事", freq: "每日1次", mode: "家属协助", enabled: true }], "中风险");
    expect(out.training.map(t => t.activity)).toEqual(["记录三件事"]);
    expect(out.interventions?.find(i => i.category === "睡眠")?.actions).toEqual(["睡眠：规律作息"]);
  });
});
