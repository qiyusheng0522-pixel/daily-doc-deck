import type { Referral } from "@/data/patients";
import { supabase } from "@/integrations/supabase/client";

export function referralApprovalQueue<T extends Pick<Referral, "patient_id" | "direction" | "approval_status">>(rows: T[]): T[] {
  const seen = new Set<string>();
  return rows.filter(r => {
    if (r.direction !== "上转" || r.approval_status !== "待审批" || seen.has(r.patient_id)) return false;
    seen.add(r.patient_id);
    return true;
  });
}

export function upwardReferralState(rows: Referral[], patientId: string): string | undefined {
  const r = rows.find(r => r.patient_id === patientId && r.direction === "上转" && r.approval_status);
  if (!r) return;
  return r.approval_status === "已转出" && r.status === "已接收" ? "上级医院已接收" : r.approval_status;
}

export async function reviewUpwardReferral(referralId: string, approve: boolean, note: string, dept: string, doctor: string) {
  const { error } = await supabase.rpc("review_upward_referral", { _referral_id: referralId, _approve: approve, _note: note, _dept: dept, _doctor_name: doctor });
  if (error) throw error;
}