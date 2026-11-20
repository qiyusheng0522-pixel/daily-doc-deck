import { describe, expect, it } from "vitest";
import { patientTrainingCheckins } from "@/data/trainingSources";
const base = { title: "记忆配对", duration_min: 20, note: "完成", recorded_by: "家属协助", created_at: "2026-11-19T10:00:00Z", plan_version: "旧版本" };
describe("患者打卡训练来源", () => {
  it("只列训练，不将营养睡眠算作训练", () => expect(patientTrainingCheckins([ {...base,id:"1",category:"训练",recorded_on:"2026-11-19"}, {...base,id:"2",category:"营养",recorded_on:"2026-11-19"}, {...base,id:"3",category:"睡眠",recorded_on:"2026-11-19"}]).map(r=>r.id)).toEqual(["1"]));
  it("时间筛选保留历史方案记录并按日期倒序", () => expect(patientTrainingCheckins([ {...base,id:"1",category:"训练",recorded_on:"2026-11-17"}, {...base,id:"2",category:"训练",recorded_on:"2026-11-19"}, {...base,id:"3",category:"训练",recorded_on:"2026-10-01"} ],"2026-11-01").map(r=>r.id)).toEqual(["2","1"]));
});