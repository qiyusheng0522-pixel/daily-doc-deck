import { describe, expect, it } from "vitest";
import { activityDays, activityTotals, activityTrend, concernDistribution } from "../pages/screen/provinceActivityData";

describe("province demonstration aggregates", () => {
  const now = new Date(2026, 10, 20, 12, 56);
  it("handles temporarily missing overview records without crashing", () => {
    const empty = { screened: 0, positive: 0, negative: 0, low: 0, medium: 0, high: 0, pending: 0 };
    expect(activityTotals(undefined)).toEqual(empty);
    expect(activityTotals(null)).toEqual(empty);
    expect(activityTrend(undefined)).toEqual([]);
    expect(concernDistribution(undefined).reduce((sum, row) => sum + row.value, 0)).toBe(0);
  });
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