import { planConfirmed } from "@/data/cognitive";
import { filterCommunityPatients, pendingCommunityReferral } from "@/data/communityReception";
import { isScreeningNegative } from "@/data/communityPatientPresentation";
import type { Patient, Referral, NurseTask, Followup } from "@/data/patients";

export const AD8_REQUEST = "AD-8 初筛评估申请";
export type WorkKind = "待评估" | "待宣教" | "待随访" | "待训练" | "待接收";
export type CommunityWork = { id: string; patientId: string; kind: WorkKind; title: string; time: string; to: string };
type Training = { patient_id: string; activity: string; trained_on: string; completion: string };
type PlanTraining = { activity: string; frequency?: string; setting?: string; dates?: string[]; date?: string };
type ScheduledPlan = { start_date?: string; end_date?: string; cycle_weeks?: number; training?: PlanTraining[] };

export function trainingDueToday(p: Patient, records: Training[], today: string): PlanTraining[] {
  if (!planConfirmed(p)) return [];
  const plan = p.ai_plan as ScheduledPlan;
  const start = plan.start_date ?? p.ai_plan_at?.slice(0, 10);
  if (!start || today < start || (plan.end_date && today > plan.end_date)) return [];
  if (plan.cycle_weeks && (Date.parse(today) - Date.parse(start)) / 86400000 >= plan.cycle_weeks * 7) return [];
  const weekday = "日一二三四五六"[new Date(`${today}T12:00:00+08:00`).getUTCDay()];
  return (plan.training ?? []).filter(t => {
    if (/家庭|居家/.test(t.setting ?? "")) return false;
    const frequency = t.frequency ?? "";
    const dates = t.dates ?? (t.date ? [t.date] : frequency.match(/\d{4}-\d{2}-\d{2}/g) ?? []);
    const weekdays = [...frequency.matchAll(/(?:周|星期)([一二三四五六日天])/g)].map(m => m[1] === "天" ? "日" : m[1]);
    const scheduled = dates.length ? dates.includes(today) : weekdays.length ? weekdays.includes(weekday) : /每天|每日/.test(frequency);
    return scheduled && !records.some(r => r.patient_id === p.id && r.activity === t.activity && r.trained_on === today && /^(完成|已完成)$/.test(r.completion));
  });
}

export function communityWorkQueues(patients: Patient[], referrals: Referral[], tasks: NurseTask[], followups: Followup[], trainings: Training[], today: string) {
  const community = filterCommunityPatients(patients, referrals, { reception: "全部患者", risk: "全部", source: "全部", gender: "全部", query: "" });
  // 初筛阴性患者只保留基本信息，不进入宣教、随访、等待办，与患者列表的操作入口保持一致
  const operational = community.filter(p => !isScreeningNegative(p));
  const ids = new Set(operational.map(p => p.id));
  const pending = tasks.filter(t => ids.has(t.patient_id) && t.status === "待执行");
  const assessment = community.filter(p => p.ad8 == null);
  const education = pending.filter(t => t.kind === "宣教");
  const followup = followups.filter(f => ids.has(f.patient_id) && f.status !== "已完成");
  const training = operational.filter(p => trainingDueToday(p, trainings, today).length > 0);
  const name = (id: string) => community.find(p => p.id === id)?.name ?? "患者";
  const list: CommunityWork[] = [
    ...community.flatMap(p => {
      const referral = pendingCommunityReferral(referrals, p.id);
      return referral ? [{ id: `receive-${p.id}`, patientId: p.id, kind: "待接收" as const, title: `${p.name} · 上级下转待接收`, time: referral.created_at.slice(0, 10), to: "/community/patients?tab=new" }] : [];
    }),
    ...assessment.map(p => ({ id: `assessment-${p.id}`, patientId: p.id, kind: "待评估" as const, title: `${p.name} · AD-8 初筛评估`, time: "待评估", to: `/community/patients/${p.id}?tab=scale&action=ad8` })),
    ...education.map(t => ({ id: `education-${t.id}`, patientId: t.patient_id, kind: "待宣教" as const, title: `${name(t.patient_id)} · ${t.title}`, time: t.due_text ?? "待宣教", to: `/community/education?task=${t.id}` })),
    ...followup.map(f => ({ id: `followup-${f.id}`, patientId: f.patient_id, kind: "待随访" as const, title: `${name(f.patient_id)} · ${f.item}`, time: f.status, to: `/community/followup?patient=${f.patient_id}` })),
    ...training.map(p => ({ id: `training-${p.id}`, patientId: p.id, kind: "待训练" as const, title: `${p.name} · ${trainingDueToday(p, trainings, today).map(t => t.activity).join("、")}`, time: today, to: `/community/patients/${p.id}?tab=training` })),
  ];
  return { community, assessment, education, followup, training, list };
}