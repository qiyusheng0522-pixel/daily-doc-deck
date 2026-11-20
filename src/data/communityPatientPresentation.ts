import { communityScreeningAbnormal } from "@/data/communityReception";

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