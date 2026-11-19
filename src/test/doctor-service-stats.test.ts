import { expect, it } from "vitest";
import { doctorServiceStats } from "@/data/doctorServiceStats";

it("转诊率以在管患者为分母，下转患者去重，待接收对象不计入", () => {
  expect(doctorServiceStats([{ id: "a" }, { id: "b" }, { id: "c" }], [
    { patient_id: "a", direction: "下转", status: "已接收" },
    { patient_id: "a", direction: "下转", status: "待接收" },
    { patient_id: "c", direction: "上转", status: "待接收" },
  ])).toEqual({ managedCount: 2, referredCount: 1, referralRate: 50 });
});
it("无在管患者时不虚构转诊率", () => {
  expect(doctorServiceStats([], []).referralRate).toBeNull();
});