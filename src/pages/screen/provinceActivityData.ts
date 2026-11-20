import { REGION_DATA } from "./provinceData";

// Illustrative aggregates only; never infer assessed risk or diagnosis from AD-8.
export type Activity = { city: string; community: string; time: string; screened: number; negative: number; positive: number; low: number; medium: number; high: number; pending: number };
export const PERIODS = [1, 7, 14, 30] as const;
export type Period = typeof PERIODS[number];
export function activityDays(days: number, now = new Date()) {
  return Array.from({ length: days }, (_, day) => {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    const stamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return REGION_DATA.map((region, index): Activity => {
      const seed = index * 7 + date.getDate() * 3 + date.getMonth();
      const low = 3 + seed % 9, medium = 2 + seed % 5, high = 1 + seed % 3, pending = 2 + seed % 4;
      const negative = 15 + seed % 17;
      const positive = low + medium + high + pending;
      return { city: region.name, community: region.name === "南京" ? "小市社区" : `${region.name}市辖区汇总`, time: `${stamp} ${String(Math.max(0, now.getHours() - index % 4)).padStart(2, "0")}:${String((now.getMinutes() + 60 - index * 3 % 60) % 60).padStart(2, "0")}`, screened: negative + positive, negative, positive, low, medium, high, pending };
    });
  }).flat();
}
export function activityTotals(rows?: Activity[] | null) {
  return (rows ?? []).reduce((sum, r) => ({ screened: sum.screened + r.screened, positive: sum.positive + r.positive, negative: sum.negative + r.negative, low: sum.low + r.low, medium: sum.medium + r.medium, high: sum.high + r.high, pending: sum.pending + r.pending }), { screened: 0, positive: 0, negative: 0, low: 0, medium: 0, high: 0, pending: 0 });
}
export function activityTrend(rows: Activity[] = []) {
  const dates = [...new Set(rows.map(r => r.time.slice(0, 10)))].sort();
  return dates.map(date => ({ date: date.slice(5), ...activityTotals(rows.filter(r => r.time.startsWith(date))) }));
}
export function concernDistribution(rows: Activity[] = []) {
  const total = activityTotals(rows).positive;
  const memory = Math.round(total * .46), attention = Math.round(total * .28), orientation = Math.round(total * .16);
  return [{ name: "记忆关注", value: memory }, { name: "注意力关注", value: attention }, { name: "定向力关注", value: orientation }, { name: "其他关注", value: total - memory - attention - orientation }];
}