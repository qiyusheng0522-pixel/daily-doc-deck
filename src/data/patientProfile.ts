// 患者档案 / 问卷完成状态 + 共享的风险评估数据
// 让"评估模块的风险内容"与"方案页顶部呈现的风险内容"完全一致

const PROFILE_KEY = "patient.profileComplete";

type Listener = () => void;
const listeners = new Set<Listener>();

export const isProfileComplete = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(PROFILE_KEY) === "1";
};

export const setProfileComplete = (v: boolean) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_KEY, v ? "1" : "0");
  listeners.forEach((l) => l());
};

export const subscribeProfile = (l: Listener) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

// —— 统一的风险内容（供评估详情页与方案页 hero 使用） ——

export type RiskTag = { label: string; tone: "rose" | "orange" | "amber" | "cyan" };

export const diseaseTags: RiskTag[] = [
  { label: "高血压 3 级", tone: "rose" },
  { label: "LDL 未达标", tone: "rose" },
  { label: "颈动脉斑块", tone: "orange" },
  { label: "房颤史", tone: "orange" },
];

export const lifestyleTags: RiskTag[] = [
  { label: "口味偏咸", tone: "amber" },
  { label: "久坐少动", tone: "amber" },
  { label: "饮水不足", tone: "cyan" },
  { label: "入睡延迟", tone: "cyan" },
];

export const riskOverview = {
  level: "中高危" as const,
  essenScore: 3,
  recurrenceRisk: "7.1%",
  priority: ["血压", "血脂", "饮食钠摄入"],
};

export const riskSummaryText =
  "您为 缺血性脑卒中 二级预防重点人群：血压偏高、LDL 未达标、颈动脉斑块、房颤史，同时存在口味偏咸、久坐少动、饮水不足、入睡延迟等生活方式问题。综合评估提示 卒中复发风险偏高，需立即干预。";

export type RiskCatalogItem = { label: string; value: string; tone: string; icon: string };

// 与方案页顶部标签一一对应
export const riskCatalog: RiskCatalogItem[] = [
  { label: "高血压", value: "3 级 · 需干预", tone: "text-rose-600 bg-rose-500/10", icon: "Heart" },
  { label: "血脂 LDL", value: "未达标", tone: "text-rose-600 bg-rose-500/10", icon: "Droplets" },
  { label: "颈动脉", value: "有斑块", tone: "text-orange-600 bg-orange-500/10", icon: "Activity" },
  { label: "房颤史", value: "抗凝管理", tone: "text-orange-600 bg-orange-500/10", icon: "HeartPulse" },
  { label: "饮食", value: "口味偏咸", tone: "text-amber-600 bg-amber-500/10", icon: "Utensils" },
  { label: "运动", value: "久坐少动", tone: "text-amber-600 bg-amber-500/10", icon: "Dumbbell" },
  { label: "饮水", value: "1000-1500ml", tone: "text-cyan-700 bg-cyan-500/10", icon: "Droplets" },
  { label: "睡眠", value: "入睡延迟", tone: "text-cyan-700 bg-cyan-500/10", icon: "Moon" },
];

export const riskAdvices = [
  {
    idx: 1,
    title: "立刻控盐控油",
    desc: "每日食盐 <5g、烹调油 <25g；戒外卖，以自炊为主。每日新鲜蔬菜 ≥500g，增加低脂奶制品 250ml。",
  },
  {
    idx: 2,
    title: "循序渐进恢复运动",
    desc: "从每日散步 15 分钟开始，逐步增加至 30 分钟，每周 5 天；饭后 1 小时轻度活动，避免久卧。",
  },
  {
    idx: 3,
    title: "规律作息与自我监测",
    desc: "23 点前入睡保证 7-8 小时；每日早晚测量血压并记录；1 个月内复查血脂、血糖、同型半胱氨酸。",
  },
];
