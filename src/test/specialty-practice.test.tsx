import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SpecialtyPractice from "@/components/patient/SpecialtyPractice";
afterEach(cleanup);
describe("专项训练", () => {
  it("模拟购物4元苹果加5元牛奶需选择9元才能完成", () => {
    let result = "";
    render(<SpecialtyPractice exercise={{id:"shopping",name:"模拟购物",domain:"生活专项",kind:"shopping",variant:0}} onComplete={note => {result=note;}} />);
    fireEvent.click(screen.getByRole("button",{name:"去结算"}));
    fireEvent.click(screen.getByRole("button",{name:"7 元"}));
    fireEvent.click(screen.getByRole("button",{name:"确认"}));
    expect(screen.queryByRole("button",{name:"记录本次练习"})).toBeNull();
    fireEvent.click(screen.getByRole("button",{name:"9 元"}));
    fireEvent.click(screen.getByRole("button",{name:"确认"}));
    fireEvent.click(screen.getByRole("button",{name:"记录本次练习"}));
    expect(result).toBe("模拟购物：完成本轮专项练习");
  });
});