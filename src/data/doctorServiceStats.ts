export function doctorServiceStats(patients: { id: string }[], referrals: { patient_id: string; direction: string; status: string }[]) {
  const managed = patients.filter(p => !referrals.some(r => r.patient_id === p.id && r.direction === "上转" && r.status === "待接收"));
  const referred = managed.filter(p => referrals.some(r => r.patient_id === p.id && r.direction === "下转"));
  return { managedCount: managed.length, referredCount: referred.length, referralRate: managed.length ? Math.round(referred.length / managed.length * 100) : null };
}