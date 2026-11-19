import { describe, expect, it } from "vitest";
import { familyPlanTasks, familyVisibleTasks, prescribedBedtime } from "@/data/familyTasks";
import type { Patient } from "@/data/patients";
const p = { cognitive_risk: "中风险", ai_plan_at: "2026-11-19T00:00:00Z", ai_plan_confirmed_at: "2026-11-19T01:00:00Z", ai_plan: { interventions: [{ category: "营养", actions: ["每日补充优质蛋白"], frequency: "每天", duration: "4周" }, { category: "睡眠", actions: ["固定起床时间"], frequency: "每天", duration: "4周" }, { category: "用药", actions: ["用药任务"], frequency: "每天", duration: "4周" }], training: [{ setting: "家庭作业", activity: "图片配对", frequency: "每周2次", duration: "20分钟" }, { setting: "小组", activity: "站内训练", frequency: "每周1次", duration: "30分钟" }] } } as Pick<Patient,"cognitive_risk" | "ai_plan_at" | "ai_plan_confirmed_at" | "ai_plan">;
describe("家庭方案任务", () => {
  it("饮食和睡眠各提供一次打卡，保留全部家庭训练项目", () => {
    const tasks = familyPlanTasks(p);
    expect(familyVisibleTasks([...tasks, {...tasks[0], key: "intervention-0-1"}, {...tasks[1], key: "intervention-1-1"}, {...tasks[2], key: "training-2"}]).map(t => t.key)).toEqual(["intervention-0-0", "intervention-1-0", "training-0", "training-2"]);
  });
  it("入睡提醒只使用方案给出的时间，不虚构默认入睡时间", () => {
    expect(prescribedBedtime(familyPlanTasks(p))).toBeNull();
    expect(prescribedBedtime([{key:"sleep",category:"睡眠",title:"每晚22:30入睡",frequency:"每天",duration:""}])).toBe("22:30");
  });
  it("任务来自方案的营养、睡眠和家庭训练，不包含用药或站内小组训练", () => expect(familyPlanTasks(p).map(t => [t.category,t.title])).toEqual([["营养","每日补充优质蛋白"],["睡眠","固定起床时间"],["训练","图片配对"]]));
  it("训练保留模型方案的实际频次与时长", () => expect(familyPlanTasks(p)[2]).toEqual({ key:"training-0",category:"训练",title:"图片配对",frequency:"每周2次",duration:"20分钟" }));
  it("中风险未确认方案不形成家庭任务", () => expect(familyPlanTasks({ ...p,ai_plan_confirmed_at:null })).toEqual([]));
  it("修改后的未重新确认方案不形成家庭任务", () => expect(familyPlanTasks({ ...p,ai_plan_at:"2026-11-20T00:00:00Z" })).toEqual([]));
  it("没有方案不制造示例任务", () => expect(familyPlanTasks({ ...p,ai_plan:null })).toEqual([]));
  it("旧方案从原文家庭作业和睡眠营养建议生成任务，不带用药内容", () => {
    const old = { ...p, ai_plan: { training: [], followup: { items: ["家庭作业每周2次：图片配对", "记录睡眠时长", "核对用药"] }, caregiver_tips: ["每天保持均衡饮食"] } };
    expect(familyPlanTasks(old).map(t => t.title)).toEqual(["家庭作业每周2次：图片配对","记录睡眠时长","每天保持均衡饮食"]);
  });
});