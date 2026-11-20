export type PatientTrainingCheckin = { id: string; category: string; title: string; recorded_on: string; duration_min: number | null; note: string | null; recorded_by: string; created_at: string; plan_version: string };
/** Retain historical training check-ins; nutrition/sleep are not training sessions. */
export function patientTrainingCheckins(records: PatientTrainingCheckin[], since = "") {
  return records.filter(r => r.category === "训练" && r.recorded_on >= since).sort((a,b) => b.recorded_on.localeCompare(a.recorded_on) || b.created_at.localeCompare(a.created_at));
}