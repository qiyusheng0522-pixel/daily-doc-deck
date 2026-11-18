import type { CognitiveRisk } from "./patients";

/** 风险分层对应的干预方案与复评周期（依据训练站分级干预随访流程图） */
export const RISK_PLAN: Record<CognitiveRisk, { group: string; reassess: string; actions: string[] }> = {
  低风险: {
    group: "认知正常 / 主观认知下降",
    reassess: "每年 1 次",
    actions: ["训练站治疗师、家庭医生联合制定随访评估计划", "健康宣教"],
  },
  中风险: {
    group: "轻度认知障碍、轻度痴呆、中度痴呆",
    reassess: "每 6 个月",
    actions: [
      "开具双向转诊单，对接上级指导中心确诊 / 制定治疗方案",
      "认知训练：每周 1-3 次，每次 20-30 分钟，累计 20-36 小时/期，6-12 人小组制",
      "家庭作业每周 1-2 次，每次 20-30 分钟",
      "风险因素管理",
    ],
  },
  高风险: {
    group: "重度痴呆",
    reassess: "每 3 个月",
    actions: [
      "开具双向转诊单，对接上级指导中心",
      "长期护理或家庭病床服务，上门评估与康复干预",
      "风险因素管理",
    ],
  },
};

export const TRAINING_DOMAINS = ["记忆", "注意力", "执行功能", "定向力", "视空间", "语言", "计算", "逻辑推理"];

export function scaleLevel(kind: "mmse" | "moca" | "adl", v: number | null): string | undefined {
  if (v == null) return undefined;
  if (kind === "mmse") return v >= 27 ? "正常" : v >= 21 ? "轻度" : v >= 10 ? "中度" : "重度";
  if (kind === "moca") return v >= 26 ? "正常" : "低于 26";
  return v >= 100 ? "自理" : v >= 60 ? "轻度依赖" : v >= 40 ? "中度依赖" : "重度依赖";
}

/** AD-8 初筛：≥2 分为阳性，需转训练站进一步评估 */
export function ad8Positive(score: number) {
  return score >= 2;
}
