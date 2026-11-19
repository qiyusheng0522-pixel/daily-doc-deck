import { describe, expect, it } from "vitest";
import { selfRiskLabel } from "@/data/selfRisk";
describe("self risk labels follow the scale document", () => {
  it("SDS 53 is mild depression, 52 normal", () => { expect(selfRiskLabel("depression", 53).label).toBe("轻度抑郁"); expect(selfRiskLabel("depression", 52).label).toBe("无抑郁"); });
  it("SAS 50 is mild anxiety", () => expect(selfRiskLabel("self_anxiety", 50).label).toBe("轻度焦虑"));
  it("Morse 45 is high fall risk", () => expect(selfRiskLabel("fall", 45).level).toBe("high"));
  it("MNA 8-11 is malnutrition risk", () => expect(selfRiskLabel("nutrition", 11).label).toBe("营养不良风险"));
  it("PSQI 16 is very poor", () => expect(selfRiskLabel("sleep", 16).label).toBe("睡眠质量很差"));
});
