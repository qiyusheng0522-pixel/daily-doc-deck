/** 患者自评风险标签，按《老年认知训练站评估量表》的结果判定。 */
export function selfRiskLabel(id: string, total: number): { label: string; level: "ok" | "warn" | "high" } {
  const key = id.replace(/^self_/, "");
  switch (key) {
    case "sleep": return total <= 5 ? { label: "睡眠质量好", level: "ok" } : total <= 10 ? { label: "睡眠质量还行", level: "ok" } : total <= 15 ? { label: "睡眠质量一般", level: "warn" } : { label: "睡眠质量很差", level: "high" };
    case "nutrition": return total >= 12 ? { label: "营养正常", level: "ok" } : total >= 8 ? { label: "营养不良风险", level: "warn" } : { label: "营养不良", level: "high" };
    case "fall": return total >= 45 ? { label: "跌倒高度危险", level: "high" } : { label: "未达跌倒高危", level: "ok" };
    case "anxiety": return total < 50 ? { label: "无焦虑", level: "ok" } : total <= 59 ? { label: "轻度焦虑", level: "warn" } : total <= 69 ? { label: "中度焦虑", level: "high" } : { label: "重度焦虑", level: "high" };
    case "depression": return total < 53 ? { label: "无抑郁", level: "ok" } : total <= 62 ? { label: "轻度抑郁", level: "warn" } : total <= 72 ? { label: "中度抑郁", level: "high" } : { label: "重度抑郁", level: "high" };
    default: return { label: `${total} 分`, level: "ok" };
  }
}
