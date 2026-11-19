import { selfAssessmentConcerns, type Questionnaire } from "../../supabase/functions/_shared/selfAssessment";

const labels: Record<string, string> = {
  s1: "自评睡眠质量差", s2: "入睡慢", s3: "入睡困难", s4: "睡眠时长不足", s5: "睡眠效率低",
  s6: "夜醒或早醒", s7: "夜间如厕", s8: "呼吸不畅", s9: "咳嗽或打鼾", s10: "夜间怕冷", s11: "夜间燥热",
  s12: "做噩梦", s13: "疼痛不适", s14: "其他睡眠干扰", s15: "使用催眠药物", s16: "日间困倦", s17: "日间精力不足",
  n1: "近3个月食量减少", n2: "体重下降", n3: "活动能力受限", n4: "近期创伤或急性疾病", n5: "精神心理问题待核实", n6: "BMI偏低",
  f1: "近3月跌倒或视觉障碍", f2: "多项医学诊断", f3: "使用助行器具", f4: "使用易致跌倒药物", f5: "步态异常", f6: "忽视自身限制",
};

/** Summarize reported concerns without inventing diagnoses; anxiety/depression items use the item wording. */
export function selfAssessmentTags(q: Questionnaire, items: unknown) {
  return selfAssessmentConcerns(q, items).map(x => ({ id: x.id, label: x.id === "n2" && x.answer === "不清楚" ? "体重变化待核实" : labels[x.id] ?? `${x.question.replace(/^我/, "")}（${x.answer}）` }));
}
