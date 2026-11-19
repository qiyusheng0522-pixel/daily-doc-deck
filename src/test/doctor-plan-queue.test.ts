import { describe, it, expect } from "vitest";
import { isPendingReview } from "@/pages/doctor/DoctorPlans";

// 方案审核队列只收中、高风险且方案未确认的老人；已确认与低风险都不进队列。
describe("方案审核队列", () => {
  it("中风险未确认方案在队列中", () => {
    expect(isPendingReview({ cognitive_risk: "中风险", ai_plan: {}, ai_plan_at: "2026-01-05", ai_plan_confirmed_at: null })).toBe(true);
  });
  it("高风险尚未生成方案也在队列中", () => {
    expect(isPendingReview({ cognitive_risk: "高风险", ai_plan_at: null, ai_plan_confirmed_at: null })).toBe(true);
  });
  it("已确认方案不在队列中", () => {
    expect(isPendingReview({ cognitive_risk: "中风险", ai_plan: {}, ai_plan_at: "2026-01-05", ai_plan_confirmed_at: "2026-01-06" })).toBe(false);
  });
  it("确认后重新生成的方案回到队列", () => {
    expect(isPendingReview({ cognitive_risk: "高风险", ai_plan: {}, ai_plan_at: "2026-01-08", ai_plan_confirmed_at: "2026-01-06" })).toBe(true);
  });
  it("低风险不进方案审核队列", () => {
    expect(isPendingReview({ cognitive_risk: "低风险", ai_plan: {}, ai_plan_at: "2026-01-05", ai_plan_confirmed_at: null })).toBe(false);
  });
});
