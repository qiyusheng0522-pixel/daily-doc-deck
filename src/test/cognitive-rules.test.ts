import { describe, it, expect } from "vitest";
import { RISK_PLAN, ad8Positive } from "@/data/cognitive";

describe("认知训练站规则", () => {
  it("AD-8 ≥2 分为阳性", () => {
    expect(ad8Positive(2)).toBe(true);
    expect(ad8Positive(1)).toBe(false);
  });
  it("低风险每年复评", () => expect(RISK_PLAN["低风险"].reassess).toBe("每年 1 次"));
  it("中风险每 6 个月复评", () => expect(RISK_PLAN["中风险"].reassess).toBe("每 6 个月"));
  it("高风险每 3 个月复评", () => expect(RISK_PLAN["高风险"].reassess).toBe("每 3 个月"));
});

import { suggestRisk } from "@/data/cognitive";
describe("智能体初步风险等级", () => {
  it("MMSE<10 为高风险", () => expect(suggestRisk({ mmse: 8, moca: null, adl: 80 })).toBe("高风险"));
  it("MoCA<26 为中风险", () => expect(suggestRisk({ mmse: 28, moca: 22, adl: 100 })).toBe("中风险"));
  it("量表正常为低风险", () => expect(suggestRisk({ mmse: 29, moca: 27, adl: 100 })).toBe("低风险"));
  it("无量表不给等级", () => expect(suggestRisk({ mmse: null, moca: null, adl: null })).toBeNull());
});
