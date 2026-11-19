import { SCALES, AD8_SCALE, optionLabel } from "@/data/scales";
import { SELF_QUESTIONNAIRES } from "../../supabase/functions/_shared/selfAssessment";

export type HistoricalAssessment = { id: string; scale: string; items: unknown; total: number; created_at: string; assessed_by: string | null };

export const AD8_NAME = "AD-8";

export const SELF_MAX: Record<string, number> = { sleep: 21, nutrition: 14, fall: 125, anxiety: 100, depression: 100 };
export const SCALE_CATEGORIES = ["认知功能", "生活能力", "安全风险", "情绪心理", "睡眠健康", "营养状态"] as const;
export function scaleCategory(key: string): string {
  const k = key.toLowerCase();
  if (["mmse", "moca", "ad8", "scd_q9"].includes(k)) return "认知功能";
  if (["adl", "iadl"].includes(k)) return "生活能力";
  return { self_fall: "安全风险", self_anxiety: "情绪心理", self_depression: "情绪心理", self_sleep: "睡眠健康", self_nutrition: "营养状态" }[k] ?? "其他";
}
/** 二值条目的着色方向：good=1 为正常（MMSE/MoCA），bad=1 为异常（AD-8/SCD-Q9）。 */
export function binaryDirection(key: string): "good" | "bad" | null {
  const k = key.toLowerCase();
  return ["mmse", "moca"].includes(k) ? "good" : ["ad8", "scd_q9"].includes(k) ? "bad" : null;
}

export function scaleDefinition(scaleKey: string) {
  const key = scaleKey.toLowerCase();
  const scale = key === "ad8" ? AD8_SCALE : SCALES.find(s => s.key === key);
  const questionnaire = SELF_QUESTIONNAIRES.find(q => `self_${q.id}` === scaleKey);
  return { scale, questionnaire, criteria: scale?.criteria ?? questionnaire?.criteria, desc: scale?.desc ?? questionnaire?.desc };
}

export function assessmentHistory(records: HistoricalAssessment[]) {
  return [...records].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(record => {
    const { scale, questionnaire } = scaleDefinition(record.scale);
    const items = record.items && typeof record.items === "object" && !Array.isArray(record.items) ? record.items as Record<string, unknown> : {};
    return {
      ...record,
      name: scale?.name ?? questionnaire?.name ?? (record.scale.toLowerCase() === "ad8" ? AD8_NAME : record.scale),
      max: scale?.max ?? (questionnaire ? SELF_MAX[questionnaire.id] : undefined),
      category: scaleCategory(record.scale),
      professional: !record.scale.startsWith("self_"),
      answers: Object.entries(items).map(([key, value]) => {
        const question = questionnaire?.questions.find(q => q.id === key || q.text === key);
        const item = scale?.items.find(i => i.label === key);
        const option = question?.options.find(o => o.score === value);
        const answer = option?.label ?? (item && typeof value === "number" ? optionLabel(item, value) : String(value ?? "未记录"));
        return { question: question?.text ?? key, group: question?.group ?? item?.group, answer, score: typeof value === "number" ? value : null };
      }),
    };
  });
}
