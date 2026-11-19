import type { Advice } from "@/components/cognitive/AiAdvicePanel";
import { PLAN_GROUPS, treatmentCategories } from "@/data/treatmentPlan";

export const TABLE_GROUPS = ["非药物干预类", "危险因子与生活方式干预", "家庭作业"] as const;
export type TableGroup = typeof TABLE_GROUPS[number];
export type PlanRow = { group: TableGroup; name: string; content: string; freq: string; mode: string; enabled: boolean };
export type TableAdvice = Advice & { plan_table?: PlanRow[]; goals?: string[]; cycle_weeks?: number };

const groupOf = (category: string): TableGroup => {
  const g = PLAN_GROUPS.find(([, c]) => c.includes(category))?.[0];
  return g === "认知训练" ? "非药物干预类" : g === "家庭作业" ? "家庭作业" : "危险因子与生活方式干预";
};

/** 没有保存过表格的方案：由训练与各类干预内容展开成表格行。 */
export function planRows(plan: TableAdvice | null): PlanRow[] {
  if (!plan) return [];
  if (plan.plan_table?.length) return plan.plan_table.map(r => ({ ...r }));
  const rows: PlanRow[] = [];
  for (const t of plan.training ?? []) rows.push({ group: t.setting === "家庭作业" ? "家庭作业" : "非药物干预类", name: `${t.domain}训练`, content: t.activity, freq: [t.frequency, t.duration].filter(Boolean).join("，"), mode: t.setting, enabled: true });
  for (const i of plan.interventions ?? []) {
    if (i.category === "认知训练") continue; // 已由具体训练展开
    const group = groupOf(i.category);
    for (const a of i.actions.filter(x => x.trim())) rows.push({ group, name: i.category, content: a, freq: [i.frequency, i.duration].filter(Boolean).join("，"), mode: group === "家庭作业" ? "家属协助并记录" : group === "非药物干预类" ? "站内小组" : "健康宣教与随访", enabled: true });
  }
  return rows;
}

/** 保存表格时同步回各类干预与训练，保证社区端、家庭端读取一致。 */
export function applyRows(plan: TableAdvice, rows: PlanRow[], risk: string | null): TableAdvice {
  const on = rows.filter(r => r.enabled && (r.name.trim() || r.content.trim()));
  const text = (r: PlanRow) => (r.name.trim() ? `${r.name.trim()}：${r.content.trim()}` : r.content.trim());
  const interventions = treatmentCategories(risk).map(category => {
    const g = groupOf(category);
    const list = on.filter(r => r.group === g);
    const old = plan.interventions?.find(i => i.category === category);
    return { category, actions: list.length ? list.map(text) : old?.actions ?? [], frequency: list[0]?.freq || old?.frequency || "", duration: list[0]?.freq || old?.duration || "" };
  });
  const training = on.filter(r => r.group !== "危险因子与生活方式干预").map(r => ({ domain: r.name.replace(/训练$/, "") || "认知", activity: r.content, setting: r.group === "家庭作业" ? "家庭作业" : r.mode || "站内小组", frequency: r.freq, duration: r.freq }));
  return { ...plan, plan_table: rows, interventions, training: training.length ? training : plan.training };
}
