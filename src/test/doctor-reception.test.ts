import { describe, expect, it } from "vitest";
import { filterDoctorPatients, pendingDoctorReferral, type DoctorPatientFilters } from "@/data/doctorReception";

describe("医生接收患者", () => {
  const pending = { id: "up", patient_id: "patient", direction: "上转", status: "待接收" };
  it("待接收的上转患者可以确认接收", () => {
    expect(pendingDoctorReferral([pending], "patient")?.id).toBe("up");
  });
  it("已接收患者不重复显示接收操作", () => {
    expect(pendingDoctorReferral([{ ...pending, status: "已接收" }], "patient")).toBeUndefined();
  });
  it("下转单和其他患者的上转单不作为医生接收入口", () => {
    expect(pendingDoctorReferral([{ ...pending, direction: "下转" }, { ...pending, patient_id: "other" }], "patient")).toBeUndefined();
  });
});

describe("医生患者筛选", () => {
  const patients = [
    { id: "a", name: "张女士", diagnosis: "MCI", cognitive_diagnosis: "MCI", cognitive_risk: "中风险" as const, source: "小市社区" as const, gender: "女" as const },
    { id: "b", name: "李先生", diagnosis: "SCD", cognitive_diagnosis: "SCD", cognitive_risk: "低风险" as const, source: "南京市鼓楼医院" as const, gender: "男" as const },
    { id: "c", name: "王先生", diagnosis: "痴呆", cognitive_diagnosis: "痴呆", cognitive_risk: "高风险" as const, source: "小市社区" as const, gender: "男" as const },
  ];
  const referrals = [{ id: "up", patient_id: "a", direction: "上转", status: "待接收" }];
  const defaults: DoctorPatientFilters = { reception: "全部患者", risk: "全部", source: "全部", gender: "全部", query: "" };
  const ids = (filters: Partial<DoctorPatientFilters>) => filterDoctorPatients(patients, referrals, { ...defaults, ...filters }).map(p => p.id);
  it("待接收只显示待接收上转患者", () => expect(ids({ reception: "待接收" })).toEqual(["a"]));
  it("接收后加入在管列表并退出待接收列表", () => {
    const received = [{ ...referrals[0], status: "已接收" }];
    expect(filterDoctorPatients(patients, referrals, { ...defaults, reception: "在管患者" }).map(p => p.id)).toEqual(["b", "c"]);
    expect(filterDoctorPatients(patients, received, { ...defaults, reception: "在管患者" }).map(p => p.id)).toEqual(["a", "b", "c"]);
    expect(filterDoctorPatients(patients, received, { ...defaults, reception: "待接收" })).toEqual([]);
  });
  it.each(["低风险", "中风险", "高风险"])("支持%s筛选", risk => expect(ids({ risk })).toEqual([risk === "低风险" ? "b" : risk === "中风险" ? "a" : "c"]));
  it("支持来源渠道筛选", () => expect(ids({ source: "南京市鼓楼医院" })).toEqual(["b"]));
  it("支持性别筛选", () => expect(ids({ gender: "女" })).toEqual(["a"]));
  it("多个条件与搜索同时生效", () => {
    expect(ids({ reception: "待接收", risk: "中风险", source: "小市社区", gender: "女", query: "张" })).toEqual(["a"]);
    expect(ids({ risk: "高风险", gender: "女" })).toEqual([]);
  });
});