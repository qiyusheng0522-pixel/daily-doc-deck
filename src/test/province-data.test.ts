import { describe, expect, it } from "vitest";
import { REGION_DATA, regionalValue, serviceTrend } from "@/pages/screen/provinceData";

describe("省级区域数据联动", () => {
  it("切换区域后读取所选城市的站点数", () => {
    const nanjing = REGION_DATA.find(r => r.name === "南京");
    const xuzhou = REGION_DATA.find(r => r.name === "徐州");
    if (!nanjing || !xuzhou) throw new Error("缺少地图区域");
    expect(regionalValue(nanjing, "stations")).toBe(22);
    expect(regionalValue(xuzhou, "stations")).toBe(18);
  });
  it("所选区域趋势末期与区域筛查详情相同", () => {
    for (const region of REGION_DATA) {
      expect(serviceTrend(region).at(-1)?.screening).toBe(regionalValue(region, "screening"));
    }
  });
  it("双向转诊明细合计与全省总数一致", () => {
    expect(REGION_DATA.reduce((sum, r) => sum + regionalValue(r, "referral"), 0)).toBe(4317);
  });
});
