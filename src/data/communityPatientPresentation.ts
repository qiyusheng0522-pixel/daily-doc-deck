import { communityScreeningAbnormal, communityRiskPatient, pendingCommunityReferral } from "@/data/communityReception";
import type { Referral } from "@/data/patients";
import { SCALES } from "@/data/scales";

export type ScreeningFilter = "全部" | "待评估" | "阴性" | "阳性";
export type CommunityCategory = "all" | "screen" | "risk";
type ScreeningPatient = { id: string; ad8?: number | null; cognitive_risk?: string | null };

export function matchesCommunityCategory(p: ScreeningPatient, category: CommunityCategory): boolean {
  if (category === "screen") return p.ad8 == null;
  if (category === "risk") return communityScreeningAbnormal(p);
  return true;
}

export function matchesScreeningFilter(p: ScreeningPatient, filter: ScreeningFilter): boolean {
  if (filter === "全部") return true;
  if (filter === "待评估") return p.ad8 == null;
  if (filter === "阴性") return p.ad8 != null && !communityScreeningAbnormal(p);
  return communityScreeningAbnormal(p);
}

export function screeningPresentation(p: ScreeningPatient) {
  if (p.ad8 == null) return { result: "待评估", risk: "—", positive: false };
  const positive = communityScreeningAbnormal(p);
  return { result: positive ? "阳性" : "阴性", risk: positive ? p.cognitive_risk || "待进一步评估" : "—", positive };
}

export function missingProfessionalScales(records: { scale: string }[]) {
  const saved = new Set(records.map(r => r.scale));
  return SCALES.filter(s => !saved.has(s.key));
}

export function communityPatientAction(
  p: ScreeningPatient & { ai_plan?: unknown; mmse?: number | null; moca?: number | null; scd_q9?: number | null; adl?: number | null },
  referrals: Pick<Referral, "id" | "patient_id" | "direction" | "status">[],
  transferBusy: boolean,
  educationDue: boolean,
) {
  const detail = `/community/patients/${p.id}`;
  if (pendingCommunityReferral(referrals, p.id)) return { label: "去接收", to: `${detail}?tab=plan` };
  if (referrals.some(r => r.patient_id === p.id && r.direction === "下转" && r.status === "已接收")) return { label: "查看方案", to: `${detail}?tab=plan` };
  if (transferBusy) return { label: "查看详情", to: `${detail}?tab=overview` };
  if (communityRiskPatient(p)) return { label: "待转诊", to: `${detail}?tab=referral&action=refer` };
  if (educationDue) return { label: "宣教", to: `/community/education?patient=${p.id}` };
  if (p.ai_plan) return { label: "查看方案", to: `${detail}?tab=plan` };
  if (p.ad8 == null || (communityScreeningAbnormal(p) && !p.cognitive_risk && [p.mmse, p.moca, p.scd_q9, p.adl].every(v => v == null))) return { label: "待评估", to: `${detail}?tab=scale&view=pending` };
  if (!communityScreeningAbnormal(p)) return { label: "宣教", to: `/community/education?patient=${p.id}` };
  return { label: "查看详情", to: `${detail}?tab=overview` };
}