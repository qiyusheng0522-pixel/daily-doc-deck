import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import CognitivePractice from "@/components/patient/CognitivePractice";
afterEach(cleanup);
describe("在线认知练习", () => {
  it("倒序训练只能按9至1完成", () => {
    let result = "";
    render(<CognitivePractice kind="attention" variant={1} onComplete={note => { result = note; }} />);
    fireEvent.click(screen.getByRole("button", {name:"数字1"}));
    expect(screen.queryByRole("button", {name:"记录本次练习"})).toBeNull();
    for (let n = 9; n >= 1; n--) fireEvent.click(screen.getByRole("button", {name:`数字${n}`}));
    fireEvent.click(screen.getByRole("button", {name:"记录本次练习"}));
    expect(result).toBe("数字倒序：完成9–1排序，操作10次");
  });
  it("数字练习需按顺序完成，错误点选不会推进；完成后提供真实练习记录", () => {
    let result = "";
    let minutes = 0;
    render(<CognitivePractice kind="attention" onComplete={(note, time) => { result = note; minutes = time; }} />);
    fireEvent.click(screen.getByRole("button", { name: "数字9" }));
    expect(screen.getByRole("button", { name: "数字9" })).not.toBeDisabled();
    expect(screen.queryByRole("button", { name: "记录本次练习" })).toBeNull();
    for (let i = 1; i <= 9; i++) fireEvent.click(screen.getByRole("button", { name: `数字${i}` }));
    fireEvent.click(screen.getByRole("button", { name: "记录本次练习" }));
    expect(result).toBe("数字顺序：完成1–9排序，操作10次");
    expect(minutes).toBe(1);
  });
});