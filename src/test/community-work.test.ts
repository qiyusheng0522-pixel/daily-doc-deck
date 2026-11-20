import { describe, expect, it } from "vitest";
import { AD8_REQUEST, communityWorkQueues, trainingDueToday } from "@/data/communityWork";
import type { Patient, NurseTask, Followup, Referral } from "@/data/patients";

const patient = (id: string, patch: Partial<Patient> = {}) => ({ id, name: id, community_stage: "新接收", cognitive_risk: "中风险", ad8: null, source: "小市社区", gender: "女", ai_plan: null, ...patch } as Patient);
const trainingPatient = (frequency: string) => patient("训练", { ad8: 2, ai_plan_at: "2026-11-18T00:00:00Z", ai_plan_confirmed_at: "2026-11-19T00:00:00Z", ai_plan: { cycle_weeks: 8, training: [{ activity: "记忆训练", frequency, setting: "站内小组" }] } });
describe("社区工作台共享任务", () => {
  it("全部患者包含尚未初筛的社区患者，与初筛名单使用同一批患者", () => {
    const queues = communityWorkQueues([patient("待评估"), patient("陰性", { ad8: 1 }), patient("陽性", { ad8: 2 })], [], [], [], [], "2026-11-20");
    expect(queues.community.map(p => p.id)).toEqual(["待评估", "陰性", "陽性"]);
    expect(queues.community).toHaveLength(3);
    expect(queues.assessment.map(p => p.id)).toEqual(["待评估"]);
  });
  it("原有下转待接收事项保留并按患者去重，去处理进入待接收名单", () => {
    const referral = { id: "r1", patient_id: "接收", direction: "下转", status: "待接收", created_at: "2026-11-20" } as Referral;
    const queues = communityWorkQueues([patient("接收", { ad8: 3 })], [referral, { ...referral, id: "r2" }], [], [], [], "2026-11-20");
    expect(queues.list).toHaveLength(1);
    expect(queues.list[0].kind).toBe("待接收");
    expect(queues.list[0].to).toBe("/community/patients?tab=new");
  });
  it("待评估包含社区未初筛建档与家庭申请，重复申请按人去重", () => {
    const tasks = ["1", "2"].map(id => ({ id, patient_id: "家庭", kind: "待办", status: "待执行", title: AD8_REQUEST } as NurseTask));
    const queues = communityWorkQueues([patient("社区"), patient("家庭"), patient("已评估", { ad8: 2 })], [], tasks, [], [], "2026-11-20");
    expect(queues.assessment.map(p => p.id)).toEqual(["社区", "家庭"]);
    expect(queues.list.filter(t => t.kind === "待评估")).toHaveLength(2);
  });
  it("已完成初筛即使残留申请任务也不生成复评场景", () => {
    const task = { id: "old", patient_id: "完成", kind: "待办", status: "待执行", title: AD8_REQUEST } as NurseTask;
    const queues = communityWorkQueues([patient("完成", { ad8: 1 })], [], [task], [], [], "2026-11-20");
    expect(queues.assessment).toHaveLength(0);
    expect(queues.list).toHaveLength(0);
  });
  it("今天只排方案明确日期、星期或每日的站内训练，不把每周次数臆定为今天", () => {
    expect(trainingDueToday(trainingPatient("2026-11-20"), [], "2026-11-20")).toHaveLength(1);
    expect(trainingDueToday(trainingPatient("每周五"), [], "2026-11-20")).toHaveLength(1);
    expect(trainingDueToday(trainingPatient("每周一"), [], "2026-11-20")).toHaveLength(0);
    expect(trainingDueToday(trainingPatient("每日"), [], "2026-11-20")).toHaveLength(1);
    expect(trainingDueToday(trainingPatient("每周1–3次"), [], "2026-11-20")).toHaveLength(0);
  });
  it("未确认、未来、过期方案及今日已完成训练不进入待训练", () => {
    const p = trainingPatient("每日");
    expect(trainingDueToday({ ...p, ai_plan_confirmed_at: null }, [], "2026-11-20")).toHaveLength(0);
    expect(trainingDueToday(p, [], "2026-11-17")).toHaveLength(0);
    expect(trainingDueToday(p, [], "2027-01-20")).toHaveLength(0);
    expect(trainingDueToday(p, [{ patient_id: p.id, activity: "记忆训练", trained_on: "2026-11-20", completion: "完成" }], "2026-11-20")).toHaveLength(0);
  });
  it("首页总清单等于待评估、待宣教、待随访、待训练任务总和", () => {
    const queues = communityWorkQueues([patient("社区"), trainingPatient("每日")], [], [{ id: "宣教", patient_id: "社区", title: "认知宣教", kind: "宣教", status: "待执行" } as NurseTask], [{ id: "随访", patient_id: "社区", item: "认知随访", status: "待随访" } as Followup], [], "2026-11-20");
    expect(queues.list).toHaveLength(4);
    expect(queues.list.map(t => t.kind)).toEqual(["待评估", "待宣教", "待随访", "待训练"]);
    expect(queues.list.length).toBe(queues.assessment.length + queues.education.length + queues.followup.length + queues.training.length);
    expect(queues.list[0].to).toContain("action=ad8");
  });
});