import { selfAssessmentConcerns, type Questionnaire } from "../../supabase/functions/_shared/selfAssessment";

const labels: Record<string, string> = {
  s1: "入睡困难", s2: "睡眠时长不足", s3: "夜醒或早醒", s4: "日间困倦", s5: "使用助眠药物",
  n1: "近3个月食量减少", n2: "体重下降", n3: "活动能力受限", n4: "近期创伤或急性疾病", n5: "精神心理问题待核实",
  f1: "有跌倒经历", f2: "行走不稳", f3: "起身需支撑", f4: "担心跌倒", f5: "多药合用",
  m1: "情绪低落", m2: "兴趣减退", m3: "紧张焦虑", m4: "社交减少", m5: "自我价值感低落",
};

/** Summarize reported concerns without inventing diagnoses or calorie-intake measurements. */
export function selfAssessmentTags(q: Questionnaire, items: unknown) {
  return selfAssessmentConcerns(q, items).map(x => ({ id: x.id, label: x.id === "n2" && x.answer === "不清楚" ? "体重变化待核实" : labels[x.id] ?? "问题项待核实" }));
}