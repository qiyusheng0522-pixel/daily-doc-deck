import { communityScreeningAbnormal, communityRiskPatient, isLowRiskCommunityPatient, receivableCommunityReferral } from "@/data/communityReception";
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

/** AD-8 已填写且未达阳性线：业务上只需保留基本信息，不再提供其他处理入口。 */
export function isScreeningNegative(p: ScreeningPatient): boolean {
  return p.ad8 != null && !communityScreeningAbnormal(p);
}

export function screeningPresentation(p: ScreeningPatient) {
  if (p.ad8 == null) return { result: "待评估", risk: "—", positive: false };
  const positive = communityScreeningAbnormal(p);
  const risk = positive && ["低风险", "中风险", "高风险"].includes(p.cognitive_risk ?? "") ? p.cognitive_risk : "—";
  return { result: positive ? "阳性" : "阴性", risk, positive };
}

export function missingProfessionalScales(records: { scale: string }[]) {
  const saved = new Set(records.map(r => r.scale));
  return SCALES.filter(s => !saved.has(s.key));
}

export function communityPatientAction(
  p: ScreeningPatient & { ai_plan?: unknown; mmse?: number | null; moca?: number | null; scd_q9?: number | null; adl?: number | null },
  referrals: Pick<Referral, "id" | "patient_id" | "direction" | "status">[],
  transferBusy: boolean,
  _educationDue: boolean,
) {
  const detail = `/community/patients/${p.id}`;
  if (p.ad8 == null) return { label: "待评估", to: `${detail}?tab=scale&action=ad8` };
  if (isScreeningNegative(p) || isLowRiskCommunityPatient(p)) return { label: "查看详情", to: `${detail}?tab=overview` };
  if (receivableCommunityReferral(p, referrals, p.id)) return { label: "去接收", to: `${detail}?tab=plan` };
  if (!communityRiskPatient(p)) return { label: "查看详情", to: `${detail}?tab=overview` };
  if (referrals.some(r => r.patient_id === p.id && r.direction === "下转" && r.status === "已接收")) return { label: "查看方案", to: `${detail}?tab=plan` };
  if (transferBusy) return { label: "查看详情", to: `${detail}?tab=overview` };
  return { label: "转诊", to: `${detail}?tab=referral&action=refer` };
}