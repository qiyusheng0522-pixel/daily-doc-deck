import { expect, it } from "vitest";
import { draftPlanUpdate } from "../../supabase/functions/_shared/planRevision";

it("医院修改具体训练内容后取消旧确认，保留原方案不变", () => {
  const original = { training: [{ activity: "3件物品回忆" }] };
  const revision = { ...original, training: [{ activity: "5件物品分类后回忆，每次20分钟" }] };
  const update = draftPlanUpdate(revision, "2026-11-19T02:16:00Z");
  expect(update.ai_plan_confirmed_at).toBeNull();
  expect(update.ai_plan_confirmed_by).toBeNull();
  expect(update.ai_plan).toEqual(revision);
  expect(original.training[0].activity).toBe("3件物品回忆");
});