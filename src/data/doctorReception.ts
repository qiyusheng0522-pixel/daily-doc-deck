import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Patient } from "@/data/patients";

type ReceptionReferral = { id: string; patient_id: string; direction: string; status: string; approval_status?: string | null };

/** 一位患者只有一件接收待办；输入保持转诊时间倒序。历史记录不删除。 */
export function doctorReceptionQueue<T extends ReceptionReferral>(referrals: T[]): T[] {
  const seen = new Set<string>();
  return referrals.filter(r => {
    if (r.direction !== "上转" || r.status !== "待接收" || (r.approval_status && r.approval_status !== "已转出") || seen.has(r.patient_id)) return false;
    seen.add(r.patient_id);
    return true;
  });
}

export function pendingDoctorReferral<T extends ReceptionReferral>(referrals: T[], patientId: string): T | undefined {
  return doctorReceptionQueue(referrals).find(r => r.patient_id === patientId);
}

export async function acceptDoctorPatient(referralId: string, guidance?: { dept: string; feedback: string }) {
  const { data: referral, error: readError } = await supabase.from("referrals")
    .select("patient_id").eq("id", referralId).eq("direction", "上转").eq("status", "待接收").or("approval_status.is.null,approval_status.eq.已转出").maybeSingle();
  if (readError) throw readError;
  if (!referral) throw new Error("接收状态已更新，请重新查看");
  const { data, error } = await supabase.from("referrals")
    .update({ status: "已接收", received_at: new Date().toISOString(), ...guidance })
    .eq("patient_id", referral.patient_id).eq("direction", "上转").eq("status", "待接收")
    .or("approval_status.is.null,approval_status.eq.已转出")
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("接收状态已更新，请重新查看");
}

export type DoctorPatientFilters = {
  reception: "在管患者" | "待接收" | "全部患者";
  risk: string;
  source: string;
  gender: string;
  query: string;
};

export function filterDoctorPatients<T extends Pick<Patient, "id" | "name" | "diagnosis" | "cognitive_diagnosis" | "cognitive_risk" | "source" | "gender">>(patients: T[], referrals: ReceptionReferral[], filters: DoctorPatientFilters): T[] {
  const query = filters.query.trim();
  return patients.filter(p => {
    const pending = !!pendingDoctorReferral(referrals, p.id);
    return (filters.reception === "全部患者" || (filters.reception === "待接收" ? pending : !pending))
      && (filters.risk === "全部" || p.cognitive_risk === filters.risk)
      && (filters.source === "全部" || p.source === filters.source)
      && (filters.gender === "全部" || p.gender === filters.gender)
      && (!query || [p.name, p.diagnosis, p.cognitive_diagnosis ?? ""].some(value => value.includes(query)));
  });
}

/** 接收仅表示同意接诊，不修改诊断、指导意见或社区干预阶段。 */
export function useDoctorReception() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (referralId: string) => acceptDoctorPatient(referralId),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["referrals"] }); },
  });
}