import { describe, expect, it } from "vitest";
import { activityDays, activityTotals, activityTrend, concernDistribution, activityRanking } from "../pages/screen/provinceActivityData";

describe("province demonstration aggregates", () => {
  it("compares every ranking measure to the preceding 24 hours", () => {
    const row = activityDays(1, new Date(2026, 10, 20))[0];
    const ranking = activityRanking([{ ...row, screened: 50, low: 10, medium: 5, high: 2 }], [{ ...row, screened: 40, low: 12, medium: 5, high: 1 }]);
    expect(ranking[0].changes.screened).toBe(10);
    expect(ranking[0].changes.low).toBe(-2);
    expect(ranking[0].changes.medium).toBe(0);
    expect(ranking[0].changes.high).toBe(1);
  });
  const now = new Date(2026, 10, 20, 12, 56);
  it("keeps positive screening separate from three assessed risk levels", () => {
    const row = activityDays(1, now)[0];
    expect(row.positive).toBe(row.low + row.medium + row.high + row.pending);
    expect(row.screened).toBe(row.negative + row.positive);
    expect(row.pending).toBeGreaterThan(0);
  });
  it("shows 14 days and derives totals from the same regional records", () => {
    const rows = activityDays(14, now).filter(r => r.city === "南京");
    expect(rows).toHaveLength(14);
    const trend = activityTrend(rows);
    expect(trend).toHaveLength(14);
    expect(trend.reduce((sum, r) => sum + r.screened, 0)).toBe(activityTotals(rows).screened);
  });
  it("makes all concern segments sum to the selected positive cohort", () => {
    const rows = activityDays(1, now);
    expect(concernDistribution(rows).reduce((sum, r) => sum + r.value, 0)).toBe(activityTotals(rows).positive);
  });
});