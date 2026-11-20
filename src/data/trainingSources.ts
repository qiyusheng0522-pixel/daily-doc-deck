export type PatientTrainingCheckin = { id: string; category: string; title: string; recorded_on: string; duration_min: number | null; note: string | null; recorded_by: string; created_at: string; plan_version: string };
/** Retain historical training check-ins; nutrition/sleep are not training sessions. */
export function patientTrainingCheckins(records: PatientTrainingCheckin[], since = "") {
  return records.filter(r => r.category === "训练" && r.recorded_on >= since).sort((a,b) => b.recorded_on.localeCompare(a.recorded_on) || b.created_at.localeCompare(a.created_at));
}
/** Summarize recorded execution, not the entire prescribed instruction or submission time. */
export function patientTrainingSummary(record: PatientTrainingCheckin) {
  const note = record.note ?? "";
  const activities = ["记忆配对", "物品回忆", "日历待办", "模拟购物", "数字顺序", "数字排序", "图片配对", "数字划消"].filter(name => note.includes(name));
  const title = record.title.replace(/^家庭作业[^：:]*[：:]\s*/, "").split(/[；;。]/)[0];
  const difficulty = note.match(/难度\s*[:：]?\s*(L\d+|初级|中级|高级|简单|中等|困难|基础|进阶)/i)?.[1] ?? null;
  const time = note.match(/训练时间\s*[:：]?\s*((?:[01]?\d|2[0-3]):[0-5]\d)/)?.[1] ?? null;
  return { content: activities.length ? activities.join("、") : title, difficulty, time };
}