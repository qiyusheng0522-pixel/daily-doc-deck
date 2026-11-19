import { describe, expect, it, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { referralApprovalQueue, reviewUpwardReferral, upwardReferralState } from "@/data/referralApproval";
import { doctorReceptionQueue } from "@/data/doctorReception";
import type { Referral } from "@/data/patients";

const row: Referral = { id: "r", patient_id: "p", direction: "上转", status: "待接收", approval_status: "待审批", from_hospital: "小市社区", to_community: "南京市鼓楼医院", created_at: "2026-11-19", received_at: null, reason: "中风险申请", doctor_name: "医生" };
describe("社区转诊审批", () => {
  it("确认后的申请进入医生审批队列，一位患者仅一件待办", () => {
    expect(referralApprovalQueue([row, { ...row, id: "duplicate" }, { ...row, direction: "下转" }]).map(r => r.id)).toEqual(["r"]);
  });
  it("待审批申请不能当作医院待接收患者", () => expect(doctorReceptionQueue([row])).toEqual([]));
  it("批准转出后退出审批队列并进入医院接收队列", () => {
    const approved = { ...row, approval_status: "已转出" as const };
    expect(referralApprovalQueue([approved])).toEqual([]);
    expect(doctorReceptionQueue([approved]).map(r => r.id)).toEqual(["r"]);
    expect(upwardReferralState([approved], "p")).toBe("已转出");
  });
  it("退回申请不进入医院接收队列并显示社区退回状态", () => {
    const rejected = { ...row, approval_status: "已退回" as const };
    expect(doctorReceptionQueue([rejected])).toEqual([]);
    expect(upwardReferralState([rejected], "p")).toBe("已退回");
  });
  it("医院接收后社区显示上级医院已接收", () => expect(upwardReferralState([{ ...row, approval_status: "已转出", status: "已接收" }], "p")).toBe("上级医院已接收"));
  it("审批将意见和指定门诊医生交给受权限保护的审批操作", async () => {
    const spy = vi.spyOn(supabase, "rpc").mockResolvedValue({ error: null } as never);
    try {
      await reviewUpwardReferral("r", true, "建议上级评估", "神经内科", "指定医生");
      expect(spy).toHaveBeenCalledWith("review_upward_referral", { _referral_id: "r", _approve: true, _note: "建议上级评估", _dept: "神经内科", _doctor_name: "指定医生" });
    } finally { spy.mockRestore(); }
  });
});