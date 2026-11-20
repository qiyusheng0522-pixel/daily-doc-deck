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
export function dailyPractice(task: Pick<FamilyTask, "title" | "category">, date: string) {
  const kind = practiceKind(task);
  if (!kind) return null;
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  if (!Number.isFinite(day)) return null;
  const variant = Math.abs(day % 2);
  return { kind, variant, name: kind === "memory" ? (variant ? "自然图案配对" : "水果记忆配对") : (variant ? "数字倒序" : "数字顺序") };
}
