import { describe, it, expect } from "vitest";
import { filterCommunityPatients, pendingCommunityReferral, type CommunityPatientFilters } from "@/data/communityReception";

describe("社区患者接收与筛选", () => {
  const patients = [
    { id: "a", name: "张女士", community_stage: null, cognitive_risk: "中风险" as const, source: "南京市鼓楼医院" as const, gender: "女" as const, abnormal: false },
    { id: "b", name: "李先生", community_stage: "干预中" as const, cognitive_risk: "高风险" as const, source: "小市社区" as const, gender: "男" as const, abnormal: true },
    { id: "c", name: "王先生", community_stage: null, cognitive_risk: "低风险" as const, source: "南京市鼓楼医院" as const, gender: "男" as const, abnormal: false },
  ];
  const referrals = [{ id: "down", patient_id: "a", direction: "下转" as const, status: "待接收" as const }];
  const defaults: CommunityPatientFilters = { reception: "全部患者", risk: "全部", source: "全部", gender: "全部", query: "", abnormal: false };
  it("待接收仅包含下转单，不包含上转或已接收单", () => {
    expect(pendingCommunityReferral(referrals, "a")?.id).toBe("down");
    expect(pendingCommunityReferral([{ ...referrals[0], direction: "上转" }], "a")).toBeUndefined();
    expect(pendingCommunityReferral([{ ...referrals[0], status: "已接收" }], "a")).toBeUndefined();
  });
  it("全部患者合并在管与待接收且同一患者不重复", () => {
    expect(filterCommunityPatients(patients, referrals, defaults).map(p => p.id)).toEqual(["a", "b"]);
    expect(filterCommunityPatients([{ ...patients[0], community_stage: "新接收" }, patients[1]], referrals, defaults)).toHaveLength(2);
  });
  it("确认接收后进入在管列表并离开待接收队列", () => {
    expect(filterCommunityPatients(patients, referrals, { ...defaults, reception: "待接收" }).map(p => p.id)).toEqual(["a"]);
    const received = [{ ...referrals[0], status: "已接收" as const }];
    const managed = [{ ...patients[0], community_stage: "新接收" as const }, patients[1]];
    expect(filterCommunityPatients(managed, received, { ...defaults, reception: "在管患者" }).map(p => p.id)).toEqual(["a", "b"]);
    expect(filterCommunityPatients(managed, received, { ...defaults, reception: "待接收" })).toEqual([]);
  });
  it("异常入口只展示异常患者", () => expect(filterCommunityPatients(patients, referrals, { ...defaults, abnormal: true }).map(p => p.id)).toEqual(["b"]));
  it("风险来源性别及姓名组合筛选同时生效", () => {
    expect(filterCommunityPatients(patients, referrals, { ...defaults, risk: "中风险", source: "南京市鼓楼医院", gender: "女", query: "张" }).map(p => p.id)).toEqual(["a"]);
    expect(filterCommunityPatients(patients, referrals, { ...defaults, risk: "高风险", gender: "女" })).toEqual([]);
  });
});