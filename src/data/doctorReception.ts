import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ReceptionReferral = { id: string; patient_id: string; direction: string; status: string };

export function pendingDoctorReferral<T extends ReceptionReferral>(referrals: T[], patientId: string): T | undefined {
  return referrals.find(r => r.patient_id === patientId && r.direction === "上转" && r.status === "待接收");
}

/** 接收仅表示同意接诊，不修改诊断、指导意见或社区干预阶段。 */
export function useDoctorReception() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (referralId: string) => {
      const { data, error } = await supabase.from("referrals")
        .update({ status: "已接收", received_at: new Date().toISOString() })
        .eq("id", referralId).eq("direction", "上转").eq("status", "待接收")
        .select("id").maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("接收状态已更新，请刷新后查看");
    },
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["referrals"] }); },
  });
}