type PlanPatient = {
  cognitive_risk?: string | null;
  ai_plan?: unknown;
  ai_plan_at?: string | null;
  ai_plan_confirmed_at?: string | null;
};

/** Actual approval of the current plan, not an exemption from doctor review. */
export function isReviewedPlan(p: PlanPatient): boolean {
  return Boolean(p.ai_plan && p.ai_plan_confirmed_at &&
    (!p.ai_plan_at || p.ai_plan_at <= p.ai_plan_confirmed_at));
}

export function isPendingReview(p: PlanPatient): boolean {
  return Boolean(p.ai_plan) &&
    (p.cognitive_risk === "中风险" || p.cognitive_risk === "高风险") &&
    !isReviewedPlan(p);
}

export function doctorPlanQueues<T extends PlanPatient>(patients: T[]) {
  return {
    pending: patients.filter(isPendingReview),
    reviewed: patients.filter(isReviewedPlan),
  };
}