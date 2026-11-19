import { describe, expect, it } from "vitest";
import { pendingDoctorReferral } from "@/data/doctorReception";

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