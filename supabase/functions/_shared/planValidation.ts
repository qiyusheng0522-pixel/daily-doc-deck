import { z } from "npm:zod@3";

const text = z.string().trim().min(1).max(3000);
const list = z.array(text).max(30);
export const editablePlanSchema = z.object({
  summary: text, focus: list,
  training: z.array(z.object({ domain: z.enum(["记忆", "注意力", "执行功能", "定向力", "视空间", "语言", "计算", "逻辑与问题解决"]), activity: text, frequency: text, duration: text, setting: z.enum(["站内小组", "站内个训", "家庭作业", "家庭病床", "上门康复"]) })).min(1).max(30),
  interventions: z.array(z.object({ category: text, actions: list.min(1), frequency: text, duration: text })).max(30).optional(),
  followup: z.object({ cycle: text, reassess: text, items: list }),
  caregiver_tips: list, red_flags: list,
}).strip();