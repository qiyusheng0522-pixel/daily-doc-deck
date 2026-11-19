import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { planConfirmed } from "@/data/cognitive";
import type { Patient } from "@/data/patients";
import type { Advice } from "@/components/cognitive/AiAdvicePanel";

export type FamilyTask = { key: string; category: "营养" | "睡眠" | "训练"; title: string; frequency: string; duration: string };
export function familyPlanTasks(p: Pick<Patient, "ai_plan" | "ai_plan_at" | "ai_plan_confirmed_at" | "cognitive_risk"> | null | undefined): FamilyTask[] {
  if (!planConfirmed(p)) return [];
  const plan = p?.ai_plan as Advice;
  const tasks: FamilyTask[] = [];
  (plan.interventions ?? []).forEach((item, i) => {
    if (item.category !== "营养" && item.category !== "睡眠") return;
    const category = item.category;
    item.actions.forEach((title, j) => tasks.push({ key: `intervention-${i}-${j}`, category, title, frequency: item.frequency, duration: item.duration }));
  });
  (plan.training ?? []).forEach((t, i) => {
    if (!["家庭作业", "家庭任务", "居家", "家庭"].includes(t.setting)) return;
    tasks.push({ key: `training-${i}`, category: "训练", title: t.activity, frequency: t.frequency, duration: t.duration });
  });
  // Older confirmed plans store home instructions in follow-up/caregiver prose.
  // Reuse those exact instructions instead of inventing new clinical advice.
  if (!plan.interventions?.length) {
    const legacy = [...(plan.followup?.items ?? []).map((title, i) => ({ key: `followup-${i}`, title })), ...(plan.caregiver_tips ?? []).map((title, i) => ({ key: `caregiver-${i}`, title }))];
    legacy.forEach(item => {
      if (/用药|服药|降压药|助眠药/.test(item.title)) return;
      const category = /家庭作业/.test(item.title) ? "训练" : /营养|饮食|食欲/.test(item.title) ? "营养" : /睡眠|作息/.test(item.title) ? "睡眠" : null;
      if (!category) return;
      tasks.push({ ...item, category, frequency: category === "训练" ? "按方案家庭作业频次" : "按方案执行", duration: "" });
    });
  }
  return tasks;
}
export function familyPlanVersion(p: { ai_plan_at: string | null }): string {
  // PostgreSQL timestamptz textual form; normalize so SQL and client versions match.
  return p.ai_plan_at ? new Date(p.ai_plan_at).toISOString().replace("T", " ").replace(/\.000Z$/, "+00").replace(/Z$/, "+00") : "initial";
}
export function familyVisibleTasks(tasks: FamilyTask[]): FamilyTask[] {
  return tasks.filter((task, index) => task.category === "训练" || tasks.findIndex(t => t.category === task.category) === index);
}
export function familyTaskLabel(task: FamilyTask): string {
  if (task.category === "营养") return "饮食打卡";
  if (task.category === "睡眠") return "入睡提醒";
  const activities = task.title.match(/从(.+?)中选/);
  return activities?.[1] ?? task.title.replace(/^家庭作业[^：:]*[：:]\s*/, "").split(/[；;]/)[0].trim();
}
export const MEALS = [
  { name: "早餐", time: "07:00-08:30" },
  { name: "午餐", time: "11:00-13:00" },
  { name: "晚餐", time: "17:30-19:00" },
] as const;
export function mealTaskKey(task: FamilyTask, mealIndex: number): string {
  return `${task.key}:meal-${mealIndex}`;
}
export function prescribedBedtime(tasks: FamilyTask[]): string | null {
  for (const task of tasks.filter(t => t.category === "睡眠")) {
    const match = task.title.match(/(?:晚上|晚间|每晚)?\s*(2[0-3]|[01]?\d)\s*(?:[:：](\d{2})|点(?:(\d{1,2})分?)?)\s*(?:前)?\s*(?:入睡|睡觉|上床|就寝)/);
    if (match) return `${match[1].padStart(2, "0")}:${(match[2] ?? match[3] ?? "00").padStart(2, "0")}`;
  }
  return null;
}
export function useFamilyCheckins(patientId?: string) {
  return useQuery({ queryKey: ["family-checkins", patientId], enabled: !!patientId, queryFn: async () => {
    const { data, error } = await supabase.from("family_task_checkins").select("*").eq("patient_id", patientId ?? "").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }});
}
export function useSaveFamilyCheckin() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (input: { patient: Patient; task: FamilyTask; date: string; minutes?: number; note: string; by: string }) => {
    const { error } = await supabase.from("family_task_checkins").insert({ patient_id: input.patient.id, plan_version: familyPlanVersion(input.patient), task_key: input.task.key, category: input.task.category, title: input.task.title, recorded_on: input.date, duration_min: input.minutes ?? null, note: input.note.trim() || null, recorded_by: input.by });
    if (error) throw error;
  }, onSuccess: () => qc.invalidateQueries({ queryKey: ["family-checkins"] }) });
}