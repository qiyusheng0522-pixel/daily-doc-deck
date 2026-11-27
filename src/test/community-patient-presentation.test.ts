import { describe, it, expect } from "vitest";
import { communityPatientAction, isScreeningNegative, missingProfessionalScales, matchesCommunityCategory, matchesScreeningFilter, screeningPresentation } from "@/data/communityPatientPresentation";

describe("社区患者筛选与结果分开展示", () => {
  it("缺失初筛进入待评估而不进入阴性", () => {
    const p = { id: "new", ad8: null };
    expect(matchesScreeningFilter(p, "待评估")).toBe(true);
    expect(matchesScreeningFilter(p, "阴性")).toBe(false);
  });
  it("AD-8 1分阴性，2分阳性，不从阳性推断评估风险", () => {
    expect(matchesScreeningFilter({ id: "a", ad8: 1 }, "阴性")).toBe(true);
    expect(matchesScreeningFilter({ id: "a", ad8: 2 }, "阳性")).toBe(true);
    expect(screeningPresentation({ id: "a", ad8: 2 }).risk).toBe("—");
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
  it("只有未完成初筛才进入AD-8待评估", () => expect(communityPatientAction({ id: "a", ad8: null }, [], false, false)).toEqual({ label: "待评估", to: "/community/patients/a?tab=scale&action=ad8" }));
  it("阳性无分级不显示待评估，也不从方案推断风险", () => expect(communityPatientAction({ ...p, ai_plan: {} }, [], false, false)).toEqual({ label: "查看详情", to: "/community/patients/a?tab=overview" }));
  it("接收后操作改为查看方案", () => {
    const referral = { id: "r", patient_id: "a", direction: "下转", status: "待接收" } as const;
    const assessed = { ...p, cognitive_risk: "中风险" };
    expect(communityPatientAction(assessed, [referral], false, false).label).toBe("去接收");
    expect(communityPatientAction(assessed, [{ ...referral, status: "已接收" }], false, false)).toEqual({ label: "查看方案", to: "/community/patients/a?tab=plan" });
  });
  it("暂不显示宣教或随访操作", () => {
    expect(communityPatientAction(p, [], false, true).label).toBe("查看详情");
    expect(communityPatientAction({ ...p, cognitive_risk: "中风险" }, [], false, true).label).toBe("转诊");
  });
  it("中高风险打开转诊界面，不从初筛阳性推断资格", () => {
    for (const risk of ["中风险", "高风险"]) expect(communityPatientAction({ ...p, cognitive_risk: risk }, [], false, false)).toEqual({ label: "转诊", to: "/community/patients/a?tab=referral&action=refer" });
    expect(communityPatientAction(p, [], false, false).label).toBe("查看详情");
  });
  it("初筛阴性只保留基本信息，不给宣教、方案或转诊入口", () => {
    expect(isScreeningNegative({ id: "n", ad8: null })).toBe(false);
    expect(isScreeningNegative({ id: "n", ad8: 1 })).toBe(true);
    expect(isScreeningNegative({ id: "n", ad8: 2 })).toBe(false);
    expect(communityPatientAction({ id: "n", ad8: 1, ai_plan: {}, cognitive_risk: "中风险" }, [], false, true)).toEqual({ label: "查看详情", to: "/community/patients/n?tab=overview" });
    expect(communityPatientAction({ id: "n", ad8: 0 }, [], false, false)).toEqual({ label: "查看详情", to: "/community/patients/n?tab=overview" });
  });
  it("阴性即使有下转单及中风险旧值也只能查看详情", () => {
    const referral = { id: "r", patient_id: "n", direction: "下转", status: "待接收" } as const;
    expect(communityPatientAction({ id: "n", ad8: 1, cognitive_risk: "中风险" }, [referral], false, false).label).toBe("查看详情");
  });
  it("低风险不进入接收入口，只查看详情", () => {
    const referral = { id: "r", patient_id: "l", direction: "下转", status: "待接收" } as const;
    expect(communityPatientAction({ id: "l", ad8: 2, cognitive_risk: "低风险", ai_plan: {} }, [referral], false, false)).toEqual({ label: "查看详情", to: "/community/patients/l?tab=overview" });
    expect(communityPatientAction({ id: "l", ad8: 2, cognitive_risk: "低风险", ai_plan: {} }, [], false, true)).toEqual({ label: "查看详情", to: "/community/patients/l?tab=overview" });
    expect(communityPatientAction({ id: "l", ad8: 2, cognitive_risk: "中风险" }, [referral], false, false).label).toBe("去接收");
  });
  it("已完成量表不再列入未完成他评清单", () => {
    expect(missingProfessionalScales([{ scale: "mmse" }, { scale: "self_sleep" }]).map(s => s.key)).toEqual(["moca", "adl", "iadl", "scd_q9"]);
  });
});