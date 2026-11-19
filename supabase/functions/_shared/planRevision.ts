/** Any new draft, generated or hospital-edited, needs a new confirmation. */
export function draftPlanUpdate(plan: unknown, at: string) {
  return { ai_plan: plan, ai_plan_at: at, ai_plan_confirmed_at: null, ai_plan_confirmed_by: null };
}