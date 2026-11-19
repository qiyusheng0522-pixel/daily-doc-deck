import { SCALES, optionLabel } from "@/data/scales";
import { SELF_QUESTIONNAIRES } from "../../supabase/functions/_shared/selfAssessment";

export type HistoricalAssessment = { id: string; scale: string; items: unknown; total: number; created_at: string; assessed_by: string | null };

export const AD8_NAME = "AD-8";

export function scaleDefinition(scaleKey: string) {
  const scale = SCALES.find(s => s.key === scaleKey);
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
      max: scale?.max,
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
