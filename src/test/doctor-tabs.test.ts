import { describe, it, expect } from "vitest";
import { tabs } from "@/pages/doctor/DoctorLayout";

// 评估医生端（上级指导中心）只做确诊、下转与诊疗建议，不与患者直接沟通。
describe("评估医生端导航", () => {
  it("底部导航为工作台/患者/方案/我的四项", () => {
    expect(tabs.map((t) => t.label)).toEqual(["工作台", "患者", "方案", "我的"]);
  });

  it("不提供沟通模块", () => {
    expect(tabs.some((t) => t.label.includes("沟通"))).toBe(false);
    expect(tabs.some((t) => t.to.includes("chat") || t.to.includes("communication"))).toBe(false);
  });
});
