export type IndicatorKey = "initialScreeningRate" | "positiveGuidanceRate" | "suspectedVisitRate";
export type Counts = { eligible: number; screened: number; positive: number; guided: number; suspected: number; visited: number };
export const INDICATORS: { key: IndicatorKey; label: string; short: string; numerator: keyof Counts; denominator: keyof Counts; numeratorRule: string; denominatorRule: string; note: string }[] = [
  { key: "initialScreeningRate", label: "65岁及以上健康管理人群认知功能初筛率", short: "认知功能初筛率", numerator: "screened", denominator: "eligible", numeratorRule: "分母人群中，当年完成 AD8、MMSE、MoCA 等规范标准化初筛且有筛查记录的人数", denominatorRule: "统计周期内，本年度已纳入老年人健康管理、完成年度健康体检的65岁及以上常住老年人数", note: "按人员去重；不以平台患者数或服务人次替代健康管理体检人群。" },
  { key: "positiveGuidanceRate", label: "认知功能初筛阳性人群干预指导率", short: "初筛阳性干预指导率", numerator: "guided", denominator: "positive", numeratorRule: "初筛阳性人员中，基层医务人员已给予规范干预指导并留有书面或电子指导记录的人数", denominatorRule: "统计周期内，认知功能初筛结果判定为阳性的全部人员数", note: "指导包括风险宣教、生活方式干预、家属照护指导、定期复筛安排、就诊建议等；后续到上级医院排除认知障碍仍保留在分母，完成指导即计入分子。" },
  { key: "suspectedVisitRate", label: "疑似认知障碍人群就诊率", short: "疑似认知障碍就诊率", numerator: "visited", denominator: "suspected", numeratorRule: "疑似人群中，到具备认知障碍诊疗能力的机构就诊评估且有正式门诊病历或就诊记录的人数", denominatorRule: "统计周期内，初筛阳性且经基层医生综合评估判定为疑似认知障碍的人数（阳性人群的子集）", note: "计入神经内科、记忆门诊、老年病科、精神科等正式门诊、互联网医院线上门诊，以及三级医院下沉社区的专家/记忆门诊；仅电话或普通线上咨询、无正式就诊记录不计入。疑似不等于全部阳性，也不等于中高风险。" },
];
export function rate(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : Math.round(numerator / denominator * 1000) / 10;
}
export function indicatorResult(counts: Counts, key: IndicatorKey) {
  const indicator = INDICATORS.find(i => i.key === key);
  if (!indicator) throw new Error("未知监管指标");
  const numerator = counts[indicator.numerator], denominator = counts[indicator.denominator];
  return { numerator, denominator, value: rate(numerator, denominator) };
}
export type RegulatoryPerson = {
  id: string; age: number; resident: boolean; managedYear?: number; examYear?: number;
  screenings: { date: string; tool: string; standardized: boolean; record: boolean; positive: boolean }[];
  guidance: { date: string; primaryCare: boolean; standardized: boolean; record: boolean }[];
  suspectedAssessments: { date: string; primaryDoctor: boolean; suspected: boolean }[];
  visits: { date: string; capableInstitution: boolean; assessed: boolean; formalRecord: boolean; kind: "outpatient" | "internetHospital" | "communityExpert" | "phone" | "simpleOnline" }[];
};
// The adapter requires explicit source evidence; risk tags, referral approvals and appointments are not visit records.
export function calculateRegulatoryCounts(people: RegulatoryPerson[], start: string, end: string): Counts {
  const year = Number(end.slice(0, 4));
  const inPeriod = (date: string) => date >= start && date <= end;
  const cohorts = { eligible: new Set<string>(), screened: new Set<string>(), positive: new Set<string>(), guided: new Set<string>(), suspected: new Set<string>(), visited: new Set<string>() };
  // Merge evidence for repeated rows of the same person before testing cohort membership.
  const merged = new Map<string, RegulatoryPerson>();
  for (const person of people) {
    const previous = merged.get(person.id);
    merged.set(person.id, previous ? { ...previous, screenings: [...previous.screenings, ...person.screenings], guidance: [...previous.guidance, ...person.guidance], suspectedAssessments: [...previous.suspectedAssessments, ...person.suspectedAssessments], visits: [...previous.visits, ...person.visits] } : person);
  }
  for (const p of merged.values()) {
    const validScreen = (s: RegulatoryPerson["screenings"][number]) => s.standardized && s.record && ["AD8", "MMSE", "MOCA"].includes(s.tool.toUpperCase().replace(/[-\s]/g, ""));
    if (p.age >= 65 && p.resident && p.managedYear === year && p.examYear === year) {
      cohorts.eligible.add(p.id);
      if (p.screenings.some(s => validScreen(s) && Number(s.date.slice(0, 4)) === year && s.date <= end)) cohorts.screened.add(p.id);
    }
    if (!p.screenings.some(s => validScreen(s) && s.positive && inPeriod(s.date))) continue;
    cohorts.positive.add(p.id);
    if (p.guidance.some(g => inPeriod(g.date) && g.primaryCare && g.standardized && g.record)) cohorts.guided.add(p.id);
    if (!p.suspectedAssessments.some(a => inPeriod(a.date) && a.primaryDoctor && a.suspected)) continue;
    cohorts.suspected.add(p.id);
    if (p.visits.some(v => inPeriod(v.date) && v.capableInstitution && v.assessed && v.formalRecord && ["outpatient", "internetHospital", "communityExpert"].includes(v.kind))) cohorts.visited.add(p.id);
  }
  return Object.fromEntries(Object.entries(cohorts).map(([k, v]) => [k, v.size])) as Counts;
}
// Explicit aggregate fixtures for presentation only; never substitute these for connected health-record evidence.
export function demoRegulatoryCounts(eligible: number, screening = 92.4, guidance = 91.1, visit = 86.9): Counts {
  const screened = Math.round(eligible * screening / 100);
  const positive = Math.round(screened * .18), suspected = Math.round(positive * .42);
  return { eligible, screened, positive, guided: Math.round(positive * guidance / 100), suspected, visited: Math.round(suspected * visit / 100) };
}