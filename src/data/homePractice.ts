import type { FamilyTask } from "./familyTasks";
export type PracticeKind = "memory" | "attention";
export type HomeExercise = { id: string; name: string; domain: string; kind: PracticeKind | "recall" | "calendar" | "shopping"; variant: number };
export function homeExercises(task: Pick<FamilyTask, "title" | "category">): HomeExercise[] {
  if (task.category !== "训练") return [];
  const result: HomeExercise[] = [];
  if (/记忆|配对|回忆/.test(task.title)) result.push(
    {id:"memory-fruit",name:"水果记忆配对",domain:"记忆游戏",kind:"memory",variant:0},
    {id:"memory-nature",name:"自然图案配对",domain:"记忆游戏",kind:"memory",variant:1},
    {id:"recall",name:"物品回忆",domain:"记忆专项",kind:"recall",variant:0});
  if (/注意|数字|排序|计算/.test(task.title)) result.push(
    {id:"numbers",name:"数字顺序",domain:"注意力游戏",kind:"attention",variant:0},
    {id:"numbers-reverse",name:"数字倒序",domain:"注意力游戏",kind:"attention",variant:1});
  if (/日历|待办|定向/.test(task.title)) result.push({id:"calendar",name:"日历待办",domain:"定向专项",kind:"calendar",variant:0});
  if (/购物|计算/.test(task.title)) result.push({id:"shopping",name:"模拟购物",domain:"生活专项",kind:"shopping",variant:0});
  return result;
}
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
