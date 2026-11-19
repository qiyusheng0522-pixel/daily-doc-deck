export type ScoreTone = "neutral" | "low" | "medium" | "high";
export type PresentedScale = "ad8" | "mmse" | "moca" | "scd_q9" | "adl";

// These are score interpretations, never the patient's overall cognitive risk.
// AD-8: project screening flow (>=2 positive), no severity bands.
// MMSE: CSU MMSE reference (27–30,21–26,10–20,0–9); education affects interpretation.
// Barthel: WS/T 431—2023 (100,61–99,41–60,<=40).
export function scalePresentation(kind: PresentedScale, value: number | null): { tone: ScoreTone; label: string } {
  const max = kind === "ad8" ? 8 : kind === "adl" ? 100 : kind === "scd_q9" ? 9 : 30;
  if (value == null) return { tone: "neutral", label: "未评估" };
  if (!Number.isInteger(value) || value < 0 || value > max) return { tone: "neutral", label: "分值待核对" };
  if (kind === "ad8") return { tone: value >= 2 ? "medium" : "low", label: value >= 2 ? "筛查阳性 ≥2" : "筛查阴性" };
  if (kind === "mmse") {
    if (value >= 27) return { tone: "low", label: "参考正常范围" };
    if (value >= 21) return { tone: "low", label: "轻度异常参考" };
    if (value >= 10) return { tone: "medium", label: "中度异常参考" };
    return { tone: "high", label: "重度异常参考" };
  }
  if (kind === "moca") return { tone: value >= 26 ? "low" : "medium", label: value >= 26 ? "达到参考界值" : "低于参考界值 26" };
  if (kind === "scd_q9") return { tone: "neutral", label: "主观认知自述" };
  if (value === 100) return { tone: "low", label: "无依赖" };
  if (value > 60) return { tone: "low", label: "轻度依赖" };
  if (value > 40) return { tone: "medium", label: "中度依赖" };
  return { tone: "high", label: "重度依赖" };
}