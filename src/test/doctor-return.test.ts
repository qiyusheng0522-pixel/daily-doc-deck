import { describe, expect, it } from "vitest";
import { hasPreviousAppPage } from "@/components/doctor/DoctorBackButton";

describe("医生页面返回", () => {
  it("直接打开详情时返回站内列表而不是离开应用", () => {
    expect(hasPreviousAppPage({ idx: 0 })).toBe(false);
    expect(hasPreviousAppPage(null)).toBe(false);
  });
  it("站内进入详情后可以返回上一页", () => {
    expect(hasPreviousAppPage({ idx: 2 })).toBe(true);
  });
});