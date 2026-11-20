import { describe, expect, it } from "vitest";
import { staticChartOption } from "../pages/screen/ScreenChart";

describe("screen chart state transitions", () => {
  it("disables emphasis and select interpolation on maps and every series", () => {
    const result = staticChartOption({ animation: true, geo: { map: "jiangsu" }, series: [{ type: "scatter", stateAnimation: { duration: 200 } }, { type: "pie" }] });
    expect(result.animation).toBe(false);
    expect(result.animationDurationUpdate).toBe(0);
    expect(result.geo).toEqual([expect.objectContaining({ map: "jiangsu", stateAnimation: { duration: 0, delay: 0 } })]);
    expect(result.series).toEqual([expect.objectContaining({ type: "scatter", stateAnimation: { duration: 0, delay: 0 } }), expect.objectContaining({ type: "pie", stateAnimation: { duration: 0, delay: 0 } })]);
  });
  it("normalizes single-series options without inventing missing geography", () => {
    const result = staticChartOption({ series: { type: "radar", data: [{ value: [64, 81, 89] }] } });
    expect(result.geo).toBeUndefined();
    expect(result.series).toEqual([expect.objectContaining({ type: "radar", data: [{ value: [64, 81, 89] }], animation: false })]);
  });
});