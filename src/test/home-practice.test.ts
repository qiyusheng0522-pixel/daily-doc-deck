import { describe, expect, it } from "vitest";
import { cognitiveRiskLevel, practiceKind, dailyPractice, homeExercises } from "@/data/homePractice";
describe("家庭认知练习与风险", () => {
  it("家庭训练同时提供多种游戏及方案对应的专项练习", () => {
    expect(homeExercises({category:"训练",title:"日历待办、物品回忆、模拟购物"}).map(x => x.id)).toEqual(["memory-fruit","memory-nature","recall","calendar","shopping"]);
    expect(homeExercises({category:"营养",title:"物品回忆"})).toEqual([]);
    expect(homeExercises({category:"训练",title:"语言交流"})).toEqual([]);
  });
  it("每日轮换同类游戏，同一天保持一致且不替换无关方案", () => {
    const task = { category: "训练" as const, title: "记忆配对" };
    expect(dailyPractice(task, "2026-11-20")).toEqual({kind:"memory",variant:1,name:"自然图案配对"});
    expect(dailyPractice(task, "2026-11-21")).toEqual({kind:"memory",variant:0,name:"水果记忆配对"});
    expect(dailyPractice({category:"训练",title:"语言交流"}, "2026-11-20")).toBeNull();
  });
  it("记忆训练可进行线上记忆游戏", () => expect(practiceKind({ category: "训练", title: "记忆图片配对" })).toBe("memory"));
  it("注意力训练可进行线上数字练习", () => expect(practiceKind({ category: "训练", title: "注意力数字排序" })).toBe("attention"));
  it("其他方案项目不被替换成无关游戏", () => expect(practiceKind({ category: "训练", title: "语言交流" })).toBeNull());
  it("营养任务不能变成训练游戏", () => expect(practiceKind({ category: "营养", title: "记忆饮食" })).toBeNull());
  it("风险等级仅使用已有的专业分级", () => {
    expect(["低风险","中风险","高风险"].map(cognitiveRiskLevel)).toEqual(["低风险","中风险","高风险"]);
    expect(cognitiveRiskLevel(null)).toBeNull();
    expect(cognitiveRiskLevel("AD8阳性")).toBeNull();
  });
});