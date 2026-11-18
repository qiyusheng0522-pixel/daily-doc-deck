import type { CognitiveRisk } from "./patients";

/** 风险分层对应的干预方案与复评周期（依据训练站分级干预随访流程图） */
export const RISK_PLAN: Record<CognitiveRisk, { group: string; reassess: string; actions: string[]; doctor: string[]; community: string[] }> = {
  低风险: {
    group: "认知正常 / 主观认知下降",
    reassess: "每年 1 次",
    actions: ["训练站治疗师、家庭医生联合制定随访评估计划", "健康宣教"],
    doctor: ["无需转诊确诊，确认分级即可", "留在社区，每年复评 1 次"],
    community: ["与家庭医生联合制定随访评估计划", "推送健康宣教", "每年复评 1 次"],
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
    doctor: ["接收上转单，记忆门诊确诊 / 制定治疗方案", "下转训练站并给出诊疗建议", "每 6 个月复评时提供指导"],
    community: ["筛查评估后 3 个工作日内开具上转单", "下转接诊后 5 个工作日内建档", "认知训练：每周 1-3 次 × 20-30 分钟，6-12 人小组", "布置家庭作业：每周 1-2 次 × 20-30 分钟", "其他非药物干预 + 风险因素管理", "每 6 个月复评"],
  },
  高风险: {
    group: "重度痴呆",
    reassess: "每 3 个月",
    actions: [
      "开具双向转诊单，对接上级指导中心",
      "长期护理或家庭病床服务，上门评估与康复干预",
      "风险因素管理",
    ],
    doctor: ["接收上转单，确诊 / 制定治疗方案", "下转并建议长期护理或家庭病床", "每 3 个月复评时提供指导"],
    community: ["筛查评估后 3 个工作日内开具上转单", "符合条件的行动不便老人纳入家庭病床", "上门评估与康复干预", "风险因素管理", "每 3 个月复评"],
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

/** 智能体初步风险等级（供评估医生确认）：MMSE<10 或 ADL<40 → 高；MMSE<27 或 MoCA<26 → 中；否则低。无量表时返回 null。 */
export function suggestRisk(s: { mmse: number | null; moca: number | null; adl: number | null }): "低风险" | "中风险" | "高风险" | null {
  if (s.mmse == null && s.moca == null) return null;
  if ((s.mmse != null && s.mmse < 10) || (s.adl != null && s.adl < 40)) return "高风险";
  if ((s.mmse != null && s.mmse < 27) || (s.moca != null && s.moca < 26)) return "中风险";
  return "低风险";
}

/** 方案已由医生确认，且确认时间不早于最近一次生成 */
export function planConfirmed(p: { ai_plan?: unknown; ai_plan_at?: string | null; ai_plan_confirmed_at?: string | null; cognitive_risk?: string | null } | null | undefined): boolean {
  if (!p?.ai_plan) return false;
  if (!needsReferral(p.cognitive_risk)) return true; // 低风险：社区与家庭医生联合制定，无需上级医生确认
  if (!p.ai_plan_confirmed_at) return false;
  return !p.ai_plan_at || p.ai_plan_at <= p.ai_plan_confirmed_at;
}

/** 仅中、高风险需开具双向转诊单，由上级指导中心确诊并制定治疗方案 */
export function needsReferral(risk: string | null | undefined): boolean {
  return risk === "中风险" || risk === "高风险";
}

/** 可下转承接的社区认知训练站（试点：小市先行） */
export const COMMUNITY_STATIONS = ["小市社区认知训练站", "第二试点社区认知训练站（名称待定）", "县级龙头医院（接续管理）"] as const;

/** 上级指导中心确诊科室 */
export const DIAG_DEPTS = ["记忆门诊", "神经内科", "老年医学科"] as const;
/** 鼓楼医院各门诊可接诊医生（演示数据，待替换为真实排班） */
export const DEPT_DOCTORS: Record<(typeof DIAG_DEPTS)[number], string[]> = {
  记忆门诊: ["李思远 主任医师", "周敏 副主任医师"],
  神经内科: ["王立新 主任医师", "陈静 主治医师"],
  老年医学科: ["孙海燕 主任医师", "刘洋 主治医师"],
};

export const AD8_ITEMS = ["判断力出现问题（如做决定困难、财务决定错误）", "对活动和嗜好的兴趣降低", "重复相同的问题、故事或陈述", "学习使用工具、电器或小器具有困难", "忘记正确的月份或年份", "处理复杂的财务问题有困难", "记不住约会时间", "每天都有思考和记忆方面的问题"] as const;
