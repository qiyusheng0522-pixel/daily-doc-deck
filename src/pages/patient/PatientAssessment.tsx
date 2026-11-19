import { useCurrentPatient } from "@/data/patients";
import SelfAssessmentForm from "@/components/cognitive/SelfAssessmentForm";

export default function PatientAssessment() {
  const { data: patient, isLoading } = useCurrentPatient();
  if (isLoading) return <p className="p-4 text-sm text-muted-foreground">加载中…</p>;
  if (!patient) return <p className="p-4 text-sm text-muted-foreground">未找到患者档案</p>;
  return <div className="space-y-4 p-4">
    <h2 className="text-xl font-semibold">老年综合评估</h2>
    <p className="text-sm text-muted-foreground">{patient.name} · 睡眠、营养、跌倒风险、精神心理</p>
    <SelfAssessmentForm patientId={patient.id} />
  </div>;
}
