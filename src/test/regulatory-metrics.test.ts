import { describe, expect, it } from "vitest";
import { calculateRegulatoryCounts, indicatorResult, rate, type RegulatoryPerson } from "@/pages/screen/regulatoryMetrics";

const start = "2026-01-01", end = "2026-10-31";
function person(id: string, overrides: Partial<RegulatoryPerson> = {}): RegulatoryPerson {
  return { id, age: 65, resident: true, managedYear: 2026, examYear: 2026,
    screenings: [{ date: "2026-05-01", tool: "AD-8", standardized: true, record: true, positive: true }],
    guidance: [], suspectedAssessments: [], visits: [], ...overrides };
}
const suspicion = [{ date: "2026-05-02", primaryDoctor: true, suspected: true }];
describe("监管三项指标口径", () => {
  it("初筛分母必须65岁及以上、常住、当年健康管理且完成体检", () => {
    const rows = [person("65"), person("64", { age: 64 }), person("nonresident", { resident: false }), person("unmanaged", { managedYear: undefined }), person("noexam", { examYear: undefined })];
    expect(calculateRegulatoryCounts(rows, start, end).eligible).toBe(1);
  });
  it("规范初筛且当年有记录才进入初筛分子，AD8/MMSE/MoCA均支持", () => {
    const rows = ["AD8", "MMSE", "MoCA"].map(tool => person(tool, { screenings: [{ date: "2026-03-01", tool, standardized: true, record: true, positive: false }] }));
    rows.push(person("missing", { screenings: [{ date: "2026-03-01", tool: "AD8", standardized: true, record: false, positive: true }] }), person("old", { screenings: [{ date: "2025-03-01", tool: "AD8", standardized: true, record: true, positive: true }] }));
    expect(indicatorResult(calculateRegulatoryCounts(rows, start, end), "initialScreeningRate")).toEqual({ numerator: 3, denominator: 5, value: 60 });
  });
  it("最初阳性即保留分母，后续不再疑似不删除；有规范基层指导记录即可计分子", () => {
    const p = person("excludedLater", { guidance: [{ date: "2026-06-01", primaryCare: true, standardized: true, record: true }], suspectedAssessments: [{ date: "2026-06-02", primaryDoctor: true, suspected: false }] });
    expect(indicatorResult(calculateRegulatoryCounts([p, person("noGuidance")], start, end), "positiveGuidanceRate")).toEqual({ numerator: 1, denominator: 2, value: 50 });
  });
  it("无书面或电子记录的指导不计分子", () => {
    expect(calculateRegulatoryCounts([person("a", { guidance: [{ date: "2026-06-01", primaryCare: true, standardized: true, record: false }] })], start, end).guided).toBe(0);
  });
  it("疑似分母仅为初筛阳性且经基层医生综合评估判定疑似者", () => {
    expect(calculateRegulatoryCounts([person("positiveOnly"), person("suspected", { suspectedAssessments: suspicion }), person("negative", { screenings: [], suspectedAssessments: suspicion })], start, end).suspected).toBe(1);
  });
  it.each(["outpatient", "internetHospital", "communityExpert"] as const)("%s正式就诊有记录可计入", kind => {
    const p = person(kind, { suspectedAssessments: suspicion, visits: [{ date: "2026-06-01", kind, capableInstitution: true, assessed: true, formalRecord: true }] });
    expect(calculateRegulatoryCounts([p], start, end).visited).toBe(1);
  });
  it.each(["phone", "simpleOnline"] as const)("%s咨询不计入正式就诊", kind => {
    expect(calculateRegulatoryCounts([person(kind, { suspectedAssessments: suspicion, visits: [{ date: "2026-06-01", kind, capableInstitution: true, assessed: true, formalRecord: true }] })], start, end).visited).toBe(0);
  });
  it("正式就诊没有病历或就诊记录不计入", () => {
    expect(calculateRegulatoryCounts([person("noRecord", { suspectedAssessments: suspicion, visits: [{ date: "2026-06-01", kind: "outpatient", capableInstitution: true, assessed: true, formalRecord: false }] })], start, end).visited).toBe(0);
  });
  it("重复人员和重复筛查记录不重复计数", () => {
    expect(calculateRegulatoryCounts([person("a"), person("a")], start, end)).toEqual({ eligible: 1, screened: 1, positive: 1, guided: 0, suspected: 0, visited: 0 });
  });
  it("统计周期之外的阳性和就诊不计入", () => {
    expect(calculateRegulatoryCounts([person("future", { screenings: [{ date: "2026-11-01", tool: "AD8", standardized: true, record: true, positive: true }] })], start, end).positive).toBe(0);
  });
  it("分母零时没有比例，不伪造0%", () => { expect(rate(0, 0)).toBeNull(); });
});