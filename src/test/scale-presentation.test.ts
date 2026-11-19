import { describe, expect, it } from "vitest";
import { scalePresentation } from "@/data/scalePresentation";

describe("量表分值呈现不替代综合风险", () => {
  it("AD-8 2分至8分均仅是筛查阳性，不虚构中高风险分界", () => {
    for (const score of [2, 3, 5, 8]) expect(scalePresentation("ad8", score)).toEqual({ tone: "medium", label: "筛查阳性 ≥2" });
    expect(scalePresentation("ad8", 1).label).toBe("筛查阴性");
  });
  it("MMSE参考区间为27–30、21–26、10–20、0–9", () => {
    expect(scalePresentation("mmse", 27).label).toBe("参考正常范围");
    expect(scalePresentation("mmse", 26).label).toBe("轻度异常参考");
    expect(scalePresentation("mmse", 21).tone).toBe("low");
    expect(scalePresentation("mmse", 20).tone).toBe("medium");
    expect(scalePresentation("mmse", 10).tone).toBe("medium");
    expect(scalePresentation("mmse", 9).tone).toBe("high");
  });
  it("Barthel 60分为中度，40分为重度，61分为轻度依赖", () => {
    expect(scalePresentation("adl", 100).label).toBe("无依赖");
    expect(scalePresentation("adl", 61).tone).toBe("low");
    expect(scalePresentation("adl", 60).label).toBe("中度依赖");
    expect(scalePresentation("adl", 41).tone).toBe("medium");
    expect(scalePresentation("adl", 40).tone).toBe("high");
  });
  it("MoCA仅使用26分参考界值，不发明三档", () => {
    expect(scalePresentation("moca", 26).tone).toBe("low");
    expect(scalePresentation("moca", 25).tone).toBe("medium");
    expect(scalePresentation("moca", 5).tone).toBe("medium");
  });
  it("无已核实的SCD-Q9三档界值时保持中性", () => expect(scalePresentation("scd_q9", 9).tone).toBe("neutral"));
  it("缺失或超出量表范围不着异常颜色", () => {
    expect(scalePresentation("mmse", null).tone).toBe("neutral");
    expect(scalePresentation("ad8", 9).label).toBe("分值待核对");
  });
});