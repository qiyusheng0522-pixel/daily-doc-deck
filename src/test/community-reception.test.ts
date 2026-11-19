import { describe, expect, it } from "vitest";
import { communityRiskPatient, communityScreeningAbnormal, filterCommunityPatients, pendingCommunityReferral } from "@/data/communityReception";
import type { Referral } from "@/data/patients";
import type { DoctorPatientFilters } from "@/data/doctorReception";

const patients = [
  { id: "a", name: "张女士", community_stage: null, cognitive_risk: "中风险" as const, source: "南京市鼓楼医院" as const, gender: "女" as const, abnormal: true, ad8: 2 },
  { id: "b", name: "李先生", community_stage: "干预中" as const, cognitive_risk: "低风险" as const, source: "小市社区" as const, gender: "男" as const, abnormal: false, ad8: 1 },
  { id: "c", name: "王先生", community_stage: null, cognitive_risk: "高风险" as const, source: "小市社区" as const, gender: "男" as const, abnormal: false, ad8: 1 },
];
const referral: Referral = { id: "down", patient_id: "a", direction: "下转", status: "待接收", from_hospital: "南京市鼓楼医院", to_community: "小市社区", reason: null, doctor_name: null, created_at: "2026-11-19", received_at: null };
const defaults: DoctorPatientFilters = { reception: "全部患者", risk: "全部", source: "全部", gender: "全部", query: "" };
describe("社区患者接收与筛选", () => {
  it("只接收待接收下转单，不接收上转单", () => {
    expect(pendingCommunityReferral([referral], "a")?.id).toBe("down");
    expect(pendingCommunityReferral([{ ...referral, direction: "上转" }], "a")).toBeUndefined();
  });
  it("全量名单合并在管与待接收，每位患者只显示一次且不纳入未下转对象", () => {
    expect(filterCommunityPatients(patients, [referral, { ...referral, id: "repeat" }], defaults).map(p => p.id)).toEqual(["a", "b"]);
  });
  it("确认接收后进入在管列表，退出待接收列表", () => {
    const received = [{ ...referral, status: "已接收" as const }];
    const updated = patients.map(p => p.id === "a" ? { ...p, community_stage: "新接收" as const } : p);
    expect(filterCommunityPatients(patients, [referral], { ...defaults, reception: "在管患者" }).map(p => p.id)).toEqual(["b"]);
    expect(filterCommunityPatients(updated, received, { ...defaults, reception: "在管患者" }).map(p => p.id)).toEqual(["a", "b"]);
    expect(filterCommunityPatients(updated, received, { ...defaults, reception: "待接收" })).toEqual([]);
  });
  it("风险、来源、性别、姓名与异常条件同时生效", () => {
    expect(filterCommunityPatients(patients, [referral], { ...defaults, reception: "待接收", risk: "中风险", source: "南京市鼓楼医院", gender: "女", query: "张", abnormal: true }).map(p => p.id)).toEqual(["a"]);
    expect(filterCommunityPatients(patients, [referral], { ...defaults, abnormal: true, gender: "男" })).toEqual([]);
  });
});
 describe("社区筛查异常与风险分级", () => {
  it("AD-8 2分及以上为筛查异常，1分与缺失不算异常", () => {
    expect(communityScreeningAbnormal({ ad8: 2 })).toBe(true);
    expect(communityScreeningAbnormal({ ad8: 8 })).toBe(true);
    expect(communityScreeningAbnormal({ ad8: 1 })).toBe(false);
    expect(communityScreeningAbnormal({ ad8: null })).toBe(false);
  });
  it("仅已保存的中高风险进入风险名单与转诊条件，不用AD-8阳性推断风险", () => {
    expect(communityRiskPatient({ cognitive_risk: "中风险" })).toBe(true);
    expect(communityRiskPatient({ cognitive_risk: "高风险" })).toBe(true);
    expect(communityRiskPatient({ cognitive_risk: "低风险" })).toBe(false);
    expect(communityRiskPatient({ cognitive_risk: "普通" })).toBe(false);
    expect(communityRiskPatient({ cognitive_risk: null })).toBe(false);
    const sample = [
      { ...patients[1], id: "low", ad8: 3, abnormal: true },
      { ...patients[1], id: "medium", cognitive_risk: "中风险" as const, ad8: 2 },
      { ...patients[1], id: "high", cognitive_risk: "高风险" as const, ad8: 1 },
      { ...patients[1], id: "unknown", cognitive_risk: null, ad8: 4 },
    ];
    expect(filterCommunityPatients(sample, [], { ...defaults, riskOnly: true }).map(p => p.id)).toEqual(["medium", "high"]);
    expect(filterCommunityPatients(sample, [], { ...defaults, abnormal: true }).map(p => p.id)).toEqual(["low", "medium", "unknown"]);
  });
});
