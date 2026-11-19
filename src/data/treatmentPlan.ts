import type { Advice } from "@/components/cognitive/AiAdvicePanel";
import { TREATMENT_PROTOCOL } from "../../supabase/functions/_shared/treatment";

export function treatmentCategories(risk: string | null) {
  return TREATMENT_PROTOCOL[risk === "高风险" ? "高风险" : "中风险"].categories;
}

export function editablePlan(plan: Advice, risk: string | null): Advice {
  const copy: Advice = JSON.parse(JSON.stringify(plan));
  copy.interventions = [...treatmentCategories(risk).map(category => copy.interventions?.find(i => i.category === category) ?? { category, actions: [], frequency: "", duration: "" }), ...(copy.interventions ?? []).filter(i => !treatmentCategories(risk).some(c => c === i.category))];
  return copy;
}

export function planEditError(plan: Advice, risk: string | null): string | null {
  if (!plan.summary.trim()) return "请填写方案概要";
  for (const category of treatmentCategories(risk)) {
    const item = plan.interventions?.find(i => i.category === category);
    if (!item?.actions.some(a => a.trim()) || !item.frequency.trim() || !item.duration.trim()) return `请补全${category}的具体内容、频次与时长`;
  }
  if (!plan.training.length) return "请至少添加一项具体训练";
  if (plan.training.some(t => !t.activity.trim() || !t.domain.trim() || !t.setting.trim() || !t.frequency.trim() || !t.duration.trim())) return "请补全每项训练的内容、领域、场景、频次与时长";
  return null;
}