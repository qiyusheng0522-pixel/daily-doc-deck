export type Question = { id: string; text: string; options: { label: string; score: number }[] };
export type Questionnaire = { id: string; name: string; desc: string; required: boolean; minutes: number; questions: Question[] };
const O = (labels: string[]) => labels.map((label, score) => ({ label, score }));
export const SELF_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: "sleep", name: "睡眠评估", desc: "近一个月睡眠质量（参照 PSQI 简版）",
    required: true, minutes: 3,
    questions: [
      { id: "s1", text: "上床后多久能入睡？", options: O(["15 分钟内", "16-30 分钟", "31-60 分钟", "超过 1 小时"]) },
      { id: "s2", text: "每晚实际睡眠时长", options: O(["7 小时以上", "6-7 小时", "5-6 小时", "不足 5 小时"]) },
      { id: "s3", text: "夜间醒来或早醒的情况", options: O(["没有", "每周少于 1 次", "每周 1-2 次", "每周 3 次以上"]) },
      { id: "s4", text: "白天犯困、精力不足", options: O(["没有", "偶尔", "经常", "几乎每天"]) },
      { id: "s5", text: "是否需要服用助眠药物", options: O(["从不", "每周少于 1 次", "每周 1-2 次", "每周 3 次以上"]) },
    ],
  },
  {
    id: "nutrition", name: "营养评估", desc: "微型营养评估简表（MNA-SF）",
    required: true, minutes: 3,
    questions: [
      { id: "n1", text: "近 3 个月食量是否减少？", options: [{ label: "明显减少", score: 0 }, { label: "轻度减少", score: 1 }, { label: "没有减少", score: 2 }] },
      { id: "n2", text: "近 3 个月体重是否下降？", options: [{ label: "下降超过 3kg", score: 0 }, { label: "不清楚", score: 1 }, { label: "下降 1-3kg", score: 2 }, { label: "没有下降", score: 3 }] },
      { id: "n3", text: "活动能力", options: [{ label: "卧床或坐轮椅", score: 0 }, { label: "能下床但不外出", score: 1 }, { label: "可以外出", score: 2 }] },
      { id: "n4", text: "近 3 个月有无心理创伤或急性疾病？", options: [{ label: "有", score: 0 }, { label: "没有", score: 2 }] },
      { id: "n5", text: "精神心理状况", options: [{ label: "严重痴呆或抑郁", score: 0 }, { label: "轻度痴呆", score: 1 }, { label: "没有问题", score: 2 }] },
    ],
  },
  {
    id: "fall", name: "跌倒风险评估", desc: "居家跌倒风险自评",
    required: true, minutes: 3,
    questions: [
      { id: "f1", text: "过去一年是否跌倒过？", options: [{ label: "没有", score: 0 }, { label: "1 次", score: 1 }, { label: "2 次及以上", score: 2 }] },
      { id: "f2", text: "走路时是否感到不稳、需要扶东西？", options: [{ label: "不需要", score: 0 }, { label: "有时", score: 1 }, { label: "经常", score: 2 }] },
      { id: "f3", text: "从椅子上站起是否需要用手撑？", options: [{ label: "不需要", score: 0 }, { label: "需要", score: 1 }] },
      { id: "f4", text: "是否担心自己会跌倒？", options: [{ label: "不担心", score: 0 }, { label: "有点担心", score: 1 }, { label: "非常担心", score: 2 }] },
      { id: "f5", text: "同时服用 4 种以上药物（含安眠/降压药）？", options: [{ label: "否", score: 0 }, { label: "是", score: 1 }] },
    ],
  },
  {
    id: "mental", name: "精神心理评估", desc: "老年抑郁 / 焦虑简评（GDS / GAD 简版）",
    required: true, minutes: 3,
    questions: [
      { id: "m1", text: "最近两周，常感到情绪低落、高兴不起来", options: O(["完全没有", "有几天", "一半以上时间", "几乎每天"]) },
      { id: "m2", text: "对以前喜欢的事情失去兴趣", options: O(["完全没有", "有几天", "一半以上时间", "几乎每天"]) },
      { id: "m3", text: "感到紧张、焦虑或坐立不安", options: O(["完全没有", "有几天", "一半以上时间", "几乎每天"]) },
      { id: "m4", text: "不愿出门、减少和亲友来往", options: O(["完全没有", "有几天", "一半以上时间", "几乎每天"]) },
      { id: "m5", text: "觉得自己没用、是家人的负担", options: O(["完全没有", "有几天", "一半以上时间", "几乎每天"]) },
    ],
  },
];

export type SelfRecord = { scale: string; items: unknown; total: number; created_at: string; assessed_by: string | null };
export function questionnaireTotal(q: Questionnaire, answers: Record<string, number>): number | null {
  if (!q.questions.every(item => item.options.some(o => o.score === answers[item.id]))) return null;
  return q.questions.reduce((sum, item) => sum + answers[item.id], 0);
}
export function latestSelfAssessments(records: SelfRecord[]) {
  return SELF_QUESTIONNAIRES.map(q => ({ questionnaire: q, record: [...records].sort((a,b) => b.created_at.localeCompare(a.created_at)).find(r => r.scale === `self_${q.id}` && questionnaireTotal(q, (r.items ?? {}) as Record<string,number>) === r.total) }));
}

/** Item-level concerns, not diagnostic cutoffs: nutrition scores run in reverse. */
export function selfAssessmentConcerns(q: Questionnaire, items: unknown) {
  const answers = (items ?? {}) as Record<string, number>;
  return q.questions.flatMap(item => {
    const option = item.options.find(o => o.score === answers[item.id]);
    if (!option) return [];
    const best = q.id === "nutrition" ? Math.max(...item.options.map(o => o.score)) : 0;
    return option.score === best ? [] : [{ question: item.text, answer: option.label, id: item.id }];
  });
}
