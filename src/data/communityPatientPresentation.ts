import { communityScreeningAbnormal } from "@/data/communityReception";

export type ScreeningFilter = "全部" | "待评估" | "阴性" | "阳性";
type ScreeningPatient = { id: string; ad8?: number | null; cognitive_risk?: string | null };

export function matchesScreeningFilter(p: ScreeningPatient, filter: ScreeningFilter, pendingIds: Set<string>): boolean {
  if (filter === "全部") return true;
  if (filter === "待评估") return pendingIds.has(p.id) || p.ad8 == null;
  if (filter === "阴性") return p.ad8 != null && !communityScreeningAbnormal(p);
  return communityScreeningAbnormal(p);
}

export function screeningPresentation(p: ScreeningPatient) {
  if (p.ad8 == null) return { result: "待评估", risk: "—", positive: false };
  const positive = communityScreeningAbnormal(p);
  return { result: positive ? "阳性" : "阴性", risk: positive ? p.cognitive_risk || "待进一步评估" : "—", positive };
}