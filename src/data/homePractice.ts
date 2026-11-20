import type { FamilyTask } from "./familyTasks";
export type PracticeKind = "memory" | "attention";
export function practiceKind(task: Pick<FamilyTask, "title" | "category">): PracticeKind | null {
  if (task.category !== "训练") return null;
  if (/记忆|配对|回忆/.test(task.title)) return "memory";
  if (/注意|数字|排序|计算/.test(task.title)) return "attention";
  return null;
}
export function cognitiveRiskLevel(risk: string | null | undefined) {
  return risk === "低风险" || risk === "中风险" || risk === "高风险" ? risk : null;
}
