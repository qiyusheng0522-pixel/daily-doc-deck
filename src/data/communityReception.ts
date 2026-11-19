import type { Patient, Referral } from "@/data/patients";
import type { DoctorPatientFilters } from "@/data/doctorReception";

export function pendingCommunityReferral<T extends Pick<Referral, "id" | "patient_id" | "direction" | "status">>(referrals: T[], patientId: string): T | undefined {
  return referrals.find(r => r.patient_id === patientId && r.direction === "下转" && r.status === "待接收");
}

export function filterCommunityPatients<T extends Pick<Patient, "id" | "name" | "community_stage" | "cognitive_risk" | "source" | "gender" | "abnormal">>(patients: T[], referrals: Referral[], filters: DoctorPatientFilters & { abnormal?: boolean }): T[] {
  return patients.filter(p => {
    const pending = !!pendingCommunityReferral(referrals, p.id);
    const managed = !!p.community_stage && !pending;
    return (filters.reception === "待接收" ? pending : filters.reception === "在管患者" ? managed : pending || managed)
      && (filters.risk === "全部" || p.cognitive_risk === filters.risk)
      && (filters.source === "全部" || p.source === filters.source)
      && (filters.gender === "全部" || p.gender === filters.gender)
      && (!filters.abnormal || p.abnormal)
      && (!filters.query.trim() || p.name.includes(filters.query.trim()));
  });
}