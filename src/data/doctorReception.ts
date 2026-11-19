import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Patient } from "@/data/patients";

type ReceptionReferral = { id: string; patient_id: string; direction: string; status: string };

export function pendingDoctorReferral<T extends ReceptionReferral>(referrals: T[], patientId: string): T | undefined {
  return referrals.find(r => r.patient_id === patientId && r.direction === "上转" && r.status === "待接收");
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