import { describe, it, expect } from "vitest";
import { matchesCommunityCategory, matchesScreeningFilter, screeningPresentation } from "@/data/communityPatientPresentation";

describe("社区患者筛选与结果分开展示", () => {
  it("缺失初筛进入待评估而不进入阴性", () => {
    const p = { id: "new", ad8: null };
    expect(matchesScreeningFilter(p, "待评估")).toBe(true);
    expect(matchesScreeningFilter(p, "阴性")).toBe(false);
  });
  it("AD-8 1分阴性，2分阳性，不从阳性推断评估风险", () => {
    expect(matchesScreeningFilter({ id: "a", ad8: 1 }, "阴性")).toBe(true);
    expect(matchesScreeningFilter({ id: "a", ad8: 2 }, "阳性")).toBe(true);
    expect(screeningPresentation({ id: "a", ad8: 2 }).risk).toBe("待进一步评估");
  });
  it("阳性风险只读取已保存分级，阴性不混入评估风险", () => {
    for (const risk of ["低风险", "中风险", "高风险"]) expect(screeningPresentation({ id: "a", ad8: 2, cognitive_risk: risk }).risk).toBe(risk);
    expect(screeningPresentation({ id: "a", ad8: 1, cognitive_risk: "低风险" }).risk).toBe("—");
  });
  it("已完成初筛不进入待评估，保留已有结果", () => {
    const p = { id: "family", ad8: 1 };
    expect(matchesScreeningFilter(p, "待评估")).toBe(false);
    expect(screeningPresentation(p).result).toBe("阴性");
  });
  it("全部包含所有评估状态，初筛只列尚未完成AD-8者，风险名单按阳性", () => {
    const patients = [{ id: "pending", ad8: null }, { id: "negative", ad8: 1 }, { id: "positive", ad8: 2 }];
    expect(patients.filter(p => matchesCommunityCategory(p, "all"))).toHaveLength(3);
    expect(patients.filter(p => matchesCommunityCategory(p, "screen")).map(p => p.id)).toEqual(["pending"]);
    expect(patients.filter(p => matchesCommunityCategory(p, "risk")).map(p => p.id)).toEqual(["positive"]);
  });
});