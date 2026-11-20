import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useCurrentPatient } from "@/data/patients";
import SelfAssessmentForm from "@/components/cognitive/SelfAssessmentForm";
import { Button } from "@/components/ui/button";
export default function PatientAssessment() {
  const { data: patient, isLoading } = useCurrentPatient();
  const navigate = useNavigate();
  if (isLoading) return <p className="p-4 text-sm text-muted-foreground">加载中…</p>;
  if (!patient) return <p className="p-4 text-sm text-muted-foreground">未找到患者档案</p>;
  return <div className="space-y-4 p-4">
    <SelfAssessmentForm patientId={patient.id} familyList onComplete={() => navigate("/patient/risk")} />
    <Button className="w-full" variant="outline" onClick={() => navigate("/patient/risk")}><ShieldCheck className="mr-2 h-4 w-4" />查看我的评估与风险<ArrowRight className="ml-2 h-4 w-4" /></Button>
  </div>;
}
