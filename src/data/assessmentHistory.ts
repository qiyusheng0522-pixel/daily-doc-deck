import { SCALES } from "@/data/scales";
import { SELF_QUESTIONNAIRES } from "../../supabase/functions/_shared/selfAssessment";

export type HistoricalAssessment = { id: string; scale: string; items: unknown; total: number; created_at: string; assessed_by: string | null };

export function assessmentHistory(records: HistoricalAssessment[]) {
  return [...records].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(record => {
    const scale = SCALES.find(s => s.key === record.scale);
    const questionnaire = SELF_QUESTIONNAIRES.find(q => `self_${q.id}` === record.scale);
    const items = record.items && typeof record.items === "object" && !Array.isArray(record.items) ? record.items as Record<string, unknown> : {};
    return {
      ...record,
      name: scale?.name ?? questionnaire?.name ?? (record.scale.toLowerCase() === "ad8" ? "AD-8" : record.scale),
      max: scale?.max,
      answers: Object.entries(items).map(([key, value]) => {
        const question = questionnaire?.questions.find(q => q.id === key || q.text === key);
        const option = question?.options.find(o => o.score === value);
        return { question: question?.text ?? key, answer: option?.label ?? String(value ?? "未记录"), score: typeof value === "number" ? value : null };
      }),
    };
  });
}