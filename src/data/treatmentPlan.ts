import type { Advice } from "@/components/cognitive/AiAdvicePanel";
import { TREATMENT_PROTOCOL } from "../../supabase/functions/_shared/treatment";

export function treatmentCategories(risk: string | null) {
  return TREATMENT_PROTOCOL[risk === "高风险" ? "高风险" : "中风险"].categories;
}

/** 各治疗类型的标准服务内容，页面展示与编辑草稿预填共用。 */
export const STANDARD: Record<string, string[]> = {
  认知训练: ["每周 1-3 次，每次 20-30 分钟", "累计 20-36 小时/期", "6-12 人小组制，覆盖记忆、注意、执行等领域"],
  其他非药物干预: ["音乐、怀旧、运动等非药物干预", "结合兴趣安排，每周至少 1 次"],
  家庭作业: ["每周 1-2 次，每次 20-30 分钟", "家属协助完成并记录"],
  风险因素管理: ["血压、血糖、血脂监测与控制", "戒烟限酒、规律体力活动"],
  睡眠: ["规律作息，保证夜间睡眠 6-8 小时", "减少日间久睡"],
  营养: ["地中海/MIND 饮食模式", "定期评估体重与营养状况"],
  心理: ["筛查焦虑抑郁情绪", "鼓励社交参与，必要时心理疏导"],
  长期护理或家庭病床服务: ["纳入长期护理或家庭病床服务", "每 3 个月复评"],
  家庭病床准入评估: ["评估行动能力与居家条件", "符合准入条件的行动不便对象纳入家庭病床"],
  上门评估与康复干预: ["家庭病床框架内定期上门评估", "上门开展康复与认知干预"],
};

export function editablePlan(plan: Advice | null, risk: string | null): Advice {
  const copy: Advice = plan ? JSON.parse(JSON.stringify(plan)) : {
    summary: "", focus: [],
    training: [{ domain: "记忆", activity: "", setting: "站内小组", frequency: "", duration: "" }],
    followup: { cycle: "", reassess: "", items: [] },
    caregiver_tips: [], red_flags: [], interventions: [],
  };
  copy.interventions = [...treatmentCategories(risk).map(category => copy.interventions?.find(i => i.category === category) ?? { category, actions: [...(STANDARD[category] ?? [])], frequency: "", duration: "" }), ...(copy.interventions ?? []).filter(i => !treatmentCategories(risk).some(c => c === i.category))];
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
/** 非药物干预方案的三类展示分组：认知训练、家庭作业、危险因素与生活方式管理。 */
export const PLAN_GROUPS: [string, string[]][] = [
  ["认知训练", ["认知训练", "其他非药物干预", "上门评估与康复干预"]],
  ["家庭作业", ["家庭作业", "长期护理或家庭病床服务", "家庭病床准入评估"]],
  ["危险因素与生活方式管理", ["风险因素管理", "睡眠", "营养", "心理"]],
];
export function planGroups(categories: readonly string[]): [string, string[]][] {
  const known = PLAN_GROUPS.flatMap(([, c]) => c);
  const groups = PLAN_GROUPS.map(([g, c]) => [g, categories.filter(x => c.includes(x))] as [string, string[]]);
  const rest = categories.filter(x => !known.includes(x));
  if (rest.length) groups[2][1].push(...rest);
  return groups.filter(([, c]) => c.length);
}
