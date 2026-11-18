// Aggregate demonstration data only; no clinical records or provider data are fabricated here.
export const REGION_DATA = [
  { name: "南京", stations: 22, elders: 3.21, coverage: 93.6, completion: 96.8 },
  { name: "徐州", stations: 18, elders: 2.86, coverage: 91.2, completion: 95.4 },
  { name: "连云港", stations: 12, elders: 1.62, coverage: 90.8, completion: 88.1 },
  { name: "宿迁", stations: 9, elders: 1.18, coverage: 86.3, completion: 94.2 },
  { name: "淮安", stations: 11, elders: 1.74, coverage: 91.0, completion: 95.7 },
  { name: "盐城", stations: 14, elders: 2.35, coverage: 92.3, completion: 96.1 },
  { name: "扬州", stations: 13, elders: 1.96, coverage: 93.1, completion: 96.3 },
  { name: "泰州", stations: 10, elders: 1.88, coverage: 92.0, completion: 95.8 },
  { name: "南通", stations: 12, elders: 2.62, coverage: 93.4, completion: 96.6 },
  { name: "镇江", stations: 8, elders: 1.12, coverage: 92.8, completion: 94.9 },
  { name: "常州", stations: 11, elders: 1.95, coverage: 93.0, completion: 96.4 },
  { name: "无锡", stations: 12, elders: 2.31, coverage: 93.8, completion: 96.9 },
  { name: "苏州", stations: 4, elders: 2.80, coverage: 94.1, completion: 97.1 },
];
export type Region = typeof REGION_DATA[number];
export const METRICS = [
  { key: "stations", label: "训练站点", total: 156, unit: "个", definition: "已纳入建设与服务管理的认知训练站数量", note: "建设目标 200 个" },
  { key: "elders", label: "服务老年人", total: 27.6, unit: "万人", definition: "年度纳入认知健康服务管理的老年人数", note: "年度累计服务人数" },
  { key: "screening", label: "实际筛查", total: 25.5, unit: "万人", definition: "年度已完成认知初筛的老年人数", note: "AD-8 初筛服务" },
  { key: "risk", label: "高风险人群", total: 2.93, unit: "万人", definition: "风险分布中高风险与极高风险人群的合计人数", note: "高风险及极高风险" },
  { key: "intervention", label: "开展干预", total: 4.74, unit: "万人", definition: "年度接受认知训练与分级干预的老年人数", note: "分级干预服务" },
  { key: "referral", label: "转诊人数", total: 4317, unit: "人", definition: "年度登记的上转与下转服务人数", note: "双向转诊年度累计" },
  { key: "tasks", label: "训练任务", total: 42.8, unit: "万次", definition: "年度开展的认知训练任务累计次数", note: "训练任务执行次数" },
  { key: "followup", label: "随访管理", total: 6.3, unit: "万人", definition: "年度纳入持续随访服务的人数", note: "随访管理人数" },
  { key: "completion", label: "随访完成率", total: 95.7, unit: "%", definition: "已完成随访任务占应完成随访任务的比例", note: "完成随访 / 应随访" },
  { key: "acceptance", label: "接诊完成率", total: 88.7, unit: "%", definition: "已完成接诊的转诊对象占登记转诊对象的比例", note: "完成接诊 / 登记转诊" },
];
export type MetricKey = typeof METRICS[number]["key"];
export function metricFor(key: string) { return METRICS.find(m => m.key === key) ?? METRICS[0]; }
const elderSum = REGION_DATA.reduce((s, r) => s + r.elders, 0);
function distribute(total: number) {
  const weights = REGION_DATA.map(r => r.elders / elderSum * total);
  const counts = weights.map(Math.floor);
  const order = weights.map((v, i) => ({ i, fraction: v - counts[i] })).sort((a, b) => b.fraction - a.fraction);
  const remaining = total - counts.reduce((s, v) => s + v, 0);
  order.slice(0, remaining).forEach(({ i }) => { counts[i] += 1; });
  return counts;
}
export function regionalValue(region: Region, key: string): number {
  if (key === "stations") return region.stations;
  if (key === "elders") return region.elders;
  if (key === "completion") return region.completion;
  if (key === "acceptance") return +(region.coverage - 4.1).toFixed(1);
  if (key === "referral") return distribute(4317)[REGION_DATA.indexOf(region)] ?? 0;
  const total = metricFor(key).total;
  return +(total * region.elders / elderSum).toFixed(2);
}
export function formatValue(value: number, key: string) {
  return `${value.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}${metricFor(key).unit}`;
}
export const MONTHS = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];
export function serviceTrend(region?: Region) {
  const screening = region ? regionalValue(region, "screening") : 25.5;
  const intervention = region ? regionalValue(region, "intervention") : 4.74;
  const elders = region?.elders ?? 27.6;
  return MONTHS.map((month, i) => ({ month, screening: +(screening * (0.48 + i * .104)).toFixed(2), intervention: +(intervention * (.4 + i * .12)).toFixed(2), elders: +(elders * (.5 + i * .1)).toFixed(2) }));
}
export const RISKS = [
  { name: "低风险", pct: 70.5, color: "hsl(var(--scr-cyan))" },
  { name: "中风险", pct: 18.9, color: "hsl(var(--scr-gold))" },
  { name: "高风险", pct: 7.1, color: "hsl(var(--scr-red))" },
  { name: "极高风险", pct: 3.5, color: "hsl(var(--scr-violet))" },
];
export const PROVINCE_ALERTS = [
  { city: "宿迁", text: "筛查覆盖率偏低", value: "86.3%", time: "10-28 14:12", severity: "重点", metric: "screening", action: "核对辖区筛查进度，梳理未完成筛查的服务对象，协调站点补充筛查安排。" },
  { city: "连云港", text: "高风险人群随访完成率偏低", value: "88.1%", time: "10-28 13:40", severity: "关注", metric: "completion", action: "梳理未完成随访的对象及原因，优先联系高风险老人或获授权家属，提交补访安排。" },
  { city: "镇江", text: "部分站点训练任务完成进度待核查", value: "待核查", time: "10-28 11:26", severity: "关注", metric: "tasks", action: "核对站点任务记录与执行反馈，区分未开展任务和记录未提交，安排市级指导中心跟进。" },
];
