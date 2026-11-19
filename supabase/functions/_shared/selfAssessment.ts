export type Question = { id: string; text: string; group?: string; options: { label: string; score: number }[] };
export type Questionnaire = { id: string; name: string; desc: string; required: boolean; minutes: number; questions: Question[]; criteria: string; higherIsBetter?: boolean; score?: (a: Record<string, number>) => number };
const O = (labels: string[]) => labels.map((label, score) => ({ label, score }));
const FREQ = O(["无", "<1次/周", "1-2次/周", "≥3次/周"]);
const band = (v: number) => v === 0 ? 0 : v <= 2 ? 1 : v <= 4 ? 2 : 3;
const SAS_TEXT = ["我觉得比平时容易紧张和着急", "我无缘无故地感到害怕", "我容易心里烦乱或觉得惊恐", "我觉得我可能将要发疯", "我觉得一切都很好，也不会发生什么不幸", "我手脚发抖打颤", "我因为头痛、颈痛和背痛而苦恼", "我感觉容易衰弱和疲乏", "我觉得心平气和，并且容易安静坐着", "我觉得心跳得快", "我因为一阵阵头晕而苦恼", "我有过晕倒发作，或觉得要晕倒似的", "我呼气吸气都感到很容易", "我手脚麻木和刺痛", "我因胃痛和消化不良而苦恼", "我常常要小便", "我的手常常是干燥温暖的", "我脸红发热", "我容易入睡并且一夜睡得很好", "我做恶梦"];
const SAS_REV = [5, 9, 13, 17, 19];
const SDS_TEXT = ["我感到情绪沮丧，郁闷", "我感到早晨心情最好", "我要哭或想哭", "我夜间睡眠不好", "我吃饭像平时一样多", "我的性功能正常", "我感到体重减轻", "我为便秘烦恼", "我的心跳比平时快", "我无故感到疲劳", "我的头脑像往常一样清楚", "我做事情像平时一样不感到困难", "我坐卧不安，难以保持平静", "我对未来感到有希望", "我比平时更容易激怒", "我觉得决定什么事很容易", "我感到自己是有用的和不可缺少的人", "我的生活很有意义", "假若我死了别人会过得更好", "我仍旧喜爱自己平时喜爱的东西"];
const SDS_REV = [2, 5, 6, 11, 12, 14, 16, 17, 18, 20];
const zung = (prefix: string, texts: string[], rev: number[], labels: string[]) => texts.map((text, i) => ({ id: `${prefix}${i + 1}`, text,
  options: labels.map((label, j) => ({ label, score: rev.includes(i + 1) ? 4 - j : j + 1 })) }));
const raw = (a: Record<string, number>, prefix: string) => Object.entries(a).filter(([k]) => k.startsWith(prefix)).reduce((s, [, v]) => s + v, 0);

export const SELF_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: "sleep", name: "睡眠评估（PSQI）", desc: "匹兹堡睡眠质量指数量表，近一个月", required: true, minutes: 5,
    criteria: "七个成分累计 0-21 分：0-5 睡眠质量好；6-10 还行；11-15 一般；16-21 很差。",
    score: a => a.s1 + band(a.s2 + a.s3) + a.s4 + a.s5 + [0, 1, 2, 3][Math.min(3, Math.ceil([6,7,8,9,10,11,12,13,14].reduce((s, n) => s + a[`s${n}`], 0) / 9))] + a.s15 + band(a.s16 + a.s17),
    questions: [
      { id: "s1", group: "睡眠质量", text: "近一个月总的来说您认为自己的睡眠质量", options: O(["很好", "较好", "较差", "很差"]) },
      { id: "s2", group: "入睡时间", text: "近一个月从上床到入睡通常需要", options: O(["≤15分钟", "16-30分钟", "31-60分钟", ">60分钟"]) },
      { id: "s3", group: "入睡时间", text: "入睡困难（30分钟内不能入睡）", options: FREQ },
      { id: "s4", group: "睡眠时间", text: "近一个月每夜通常实际睡眠时间", options: O([">7小时", "6-7小时", "5-6小时", "<5小时"]) },
      { id: "s5", group: "睡眠效率", text: "睡眠效率（实际睡眠时间/床上时间）", options: O([">85%", "75-84%", "65-74%", "<65%"]) },
      ...["夜间易醒或早醒", "夜间去厕所", "呼吸不畅", "咳嗽或鼾声高", "感觉冷", "感觉热", "做噩梦", "疼痛不适", "其他影响睡眠的事"].map((text, i) => ({ id: `s${i + 6}`, group: "睡眠障碍", text, options: FREQ })),
      { id: "s15", group: "催眠药物", text: "近一个月您用药物催眠的情况", options: FREQ },
      { id: "s16", group: "日间功能障碍", text: "近一个月您常感到困倦吗", options: FREQ },
      { id: "s17", group: "日间功能障碍", text: "近一个月您做事的精力不足吗", options: O(["没有", "偶尔有", "有时有", "经常有"]) },
    ],
  },
  {
    id: "nutrition", name: "营养评估（MNA）", desc: "简易营养状态评估表", required: true, minutes: 3, higherIsBetter: true,
    criteria: "12-14 分正常营养状况；8-11 分有营养不良风险；0-7 分营养不良。",
    questions: [
      { id: "n1", text: "过去3个月内有没有因食欲不振、消化问题、咀嚼或吞咽困难而减少食量？", options: [{ label: "食量严重减少", score: 0 }, { label: "食量中度减少", score: 1 }, { label: "食量没有改变", score: 2 }] },
      { id: "n2", text: "过去3个月内体重下降的情况", options: [{ label: "下降大于3kg", score: 0 }, { label: "不清楚", score: 1 }, { label: "下降1-3kg", score: 2 }, { label: "体重没有下降", score: 3 }] },
      { id: "n3", text: "活动能力", options: [{ label: "需长期卧床或坐轮椅", score: 0 }, { label: "可下床但不能外出", score: 1 }, { label: "可以外出", score: 2 }] },
      { id: "n4", text: "过去3个月内有没有受到心理创伤或患上急性疾病？", options: [{ label: "有", score: 0 }, { label: "没有", score: 1 }] },
      { id: "n5", text: "精神心理问题", options: [{ label: "严重痴呆或抑郁", score: 0 }, { label: "轻度痴呆", score: 1 }, { label: "没有精神心理问题", score: 2 }] },
      { id: "n6", text: "体重指数 BMI（kg/m²；无法测量时以小腿围代替）", options: [{ label: "BMI<19", score: 0 }, { label: "19≤BMI<21", score: 1 }, { label: "21≤BMI<23", score: 2 }, { label: "BMI≥23", score: 3 }] },
    ],
  },
  {
    id: "fall", name: "跌倒风险评估（Morse）", desc: "MORSE 跌倒评估表", required: true, minutes: 3,
    criteria: "≥45 分为高度危险，应采取相应防护措施，并每周评估 1-2 次。",
    questions: [
      { id: "f1", text: "3个月内曾跌倒 / 视觉障碍", options: [{ label: "没有", score: 0 }, { label: "有", score: 25 }] },
      { id: "f2", text: "超过一个医学诊断", options: [{ label: "没有", score: 0 }, { label: "有", score: 15 }] },
      { id: "f3", text: "使用助行器具", options: [{ label: "没有需要 / 完全卧床 / 护士扶持", score: 0 }, { label: "丁形拐杖、手杖 / 学步车", score: 15 }, { label: "扶家具行走", score: 30 }] },
      { id: "f4", text: "静脉输液 / 置管 / 使用易致跌倒药物", options: [{ label: "没有", score: 0 }, { label: "有", score: 20 }] },
      { id: "f5", text: "步态", options: [{ label: "正常 / 卧床 / 轮椅代步", score: 0 }, { label: "乏力 / ≥65岁 / 体位性低血压", score: 10 }, { label: "失调及不平衡", score: 20 }] },
      { id: "f6", text: "精神状态", options: [{ label: "了解自己能力", score: 0 }, { label: "忘记自己限制 / 意识障碍 / 躁动 / 沟通或睡眠障碍", score: 15 }] },
    ],
  },
  {
    id: "anxiety", name: "焦虑自评（SAS）", desc: "焦虑自评量表，最近一周", required: true, minutes: 5,
    criteria: "标准分=粗分×1.25：<50 正常；50-59 轻度焦虑；60-69 中度焦虑；>69 重度焦虑。",
    score: a => Math.floor(raw(a, "a") * 1.25),
    questions: zung("a", SAS_TEXT, SAS_REV, ["没有或偶尔", "有时", "经常", "总是如此"]),
  },
  {
    id: "depression", name: "抑郁自评（SDS）", desc: "抑郁自评量表，最近一周", required: true, minutes: 5,
    criteria: "标准分=粗分×1.25：<53 正常；53-62 轻度抑郁；63-72 中度抑郁；>72 重度抑郁。",
    score: a => Math.floor(raw(a, "d") * 1.25),
    questions: zung("d", SDS_TEXT, SDS_REV, ["很少", "有时", "经常", "持续"]),
  },
];

export type SelfRecord = { scale: string; items: unknown; total: number; created_at: string; assessed_by: string | null };
export function questionnaireTotal(q: Questionnaire, answers: Record<string, number>): number | null {
  if (!q.questions.every(item => item.options.some(o => o.score === answers[item.id]))) return null;
  return q.score ? q.score(answers) : q.questions.reduce((sum, item) => sum + answers[item.id], 0);
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
    const scores = item.options.map(o => o.score);
    const best = q.higherIsBetter ? Math.max(...scores) : Math.min(...scores);
    return option.score === best ? [] : [{ question: item.text, answer: option.label, id: item.id }];
  });
}
