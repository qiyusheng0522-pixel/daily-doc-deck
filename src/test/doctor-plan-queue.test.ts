import { describe, it, expect } from "vitest";
import { isPendingReview, isReviewedPlan, doctorPlanQueues } from "@/data/doctorPlanQueue";

// 方案审核队列只收中、高风险且方案未确认的老人；已确认与低风险都不进队列。
describe("方案审核队列", () => {
  it("中风险未确认方案在队列中", () => {
    expect(isPendingReview({ cognitive_risk: "中风险", ai_plan: {}, ai_plan_at: "2026-01-05", ai_plan_confirmed_at: null })).toBe(true);
  });
  it("尚未生成方案不属于待审核方案", () => {
    expect(isPendingReview({ cognitive_risk: "高风险", ai_plan_at: null, ai_plan_confirmed_at: null })).toBe(false);
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
  it("转诊办理只收当前方案已完成审核者，免审核不等于已审核", () => {
    expect(isReviewedPlan({ cognitive_risk: "低风险", ai_plan: {} })).toBe(false);
    expect(isReviewedPlan({ cognitive_risk: "中风险", ai_plan: {}, ai_plan_at: "2026-11-18", ai_plan_confirmed_at: "2026-11-19" })).toBe(true);
    expect(isReviewedPlan({ cognitive_risk: "高风险", ai_plan: {}, ai_plan_at: "2026-11-20", ai_plan_confirmed_at: "2026-11-19" })).toBe(false);
  });
  it("入口数量与两份患者列表使用同一队列", () => {
    const queues = doctorPlanQueues([
      { id: "待审核", cognitive_risk: "中风险", ai_plan: {} },
      { id: "已审核", cognitive_risk: "高风险", ai_plan: {}, ai_plan_at: "2026-11-18", ai_plan_confirmed_at: "2026-11-19" },
      { id: "未生成", cognitive_risk: "高风险" },
      { id: "旧审核", cognitive_risk: "中风险", ai_plan: {}, ai_plan_at: "2026-11-20", ai_plan_confirmed_at: "2026-11-19" },
    ]);
    expect(queues.pending.map(p => p.id)).toEqual(["待审核", "旧审核"]);
    expect(queues.reviewed.map(p => p.id)).toEqual(["已审核"]);
    expect(queues.pending.length).toBe(2);
    expect(queues.reviewed.length).toBe(1);
  });
});
