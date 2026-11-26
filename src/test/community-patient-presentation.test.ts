import { describe, it, expect } from "vitest";
import { communityPatientAction, missingProfessionalScales, matchesCommunityCategory, matchesScreeningFilter, screeningPresentation } from "@/data/communityPatientPresentation";

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

describe("社区患者操作入口", () => {
  const p = { id: "a", ad8: 3 };
  it("查看详情打开概览", () => expect(communityPatientAction({ ...p, mmse: 25 }, [], false, false)).toEqual({ label: "查看详情", to: "/community/patients/a?tab=overview" }));
  it("待评估打开未完成他评量表", () => expect(communityPatientAction(p, [], false, false)).toEqual({ label: "待评估", to: "/community/patients/a?tab=scale&view=pending" }));
  it("查看方案打开方案记录", () => expect(communityPatientAction({ ...p, ai_plan: {} }, [], false, false)).toEqual({ label: "查看方案", to: "/community/patients/a?tab=plan" }));
  it("接收后操作改为查看方案", () => {
    const referral = { id: "r", patient_id: "a", direction: "下转", status: "待接收" } as const;
    expect(communityPatientAction(p, [referral], false, false).label).toBe("去接收");
    expect(communityPatientAction(p, [{ ...referral, status: "已接收" }], false, false)).toEqual({ label: "查看方案", to: "/community/patients/a?tab=plan" });
  });
  it("宣教打开已选患者的宣教库", () => expect(communityPatientAction(p, [], false, true)).toEqual({ label: "宣教", to: "/community/education?patient=a" }));
  it("待转诊打开转诊界面，不从初筛阳性推断资格", () => {
    expect(communityPatientAction({ ...p, cognitive_risk: "中风险" }, [], false, false)).toEqual({ label: "待转诊", to: "/community/patients/a?tab=referral&action=refer" });
    expect(communityPatientAction(p, [], false, false).label).not.toBe("待转诊");
  });
  it("已完成量表不再列入未完成他评清单", () => {
    expect(missingProfessionalScales([{ scale: "mmse" }, { scale: "self_sleep" }]).map(s => s.key)).toEqual(["moca", "adl", "iadl", "scd_q9"]);
  });
});