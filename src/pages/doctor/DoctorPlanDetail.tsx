import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { usePatient } from "@/data/patients";
import AiAdvicePanel from "@/components/cognitive/AiAdvicePanel";
import { needsReferral } from "@/data/cognitive";
import PlanReview from "@/components/cognitive/PlanReview";

const DoctorPlanDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: p, isLoading } = usePatient(id);
  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">加载中…</p>;
  if (!p) return <p className="p-6 text-sm text-muted-foreground">未找到该方案</p>;
  if (!needsReferral(p.cognitive_risk)) return <p className="p-6 text-sm text-muted-foreground">仅中、高风险患者需医生确认治疗方案</p>;
  return (
    <div className="min-h-full bg-muted/30">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-accent"><ArrowLeft className="h-4 w-4" /><span className="text-sm">返回</span></button>
        <h2 className="text-base font-semibold">{p.name} · 方案审核</h2>
        <button onClick={() => navigate(`/doctor/patients/${p.id}`)} className="text-xs text-primary">档案</button>
      </div>
      <div className="space-y-3 p-3"><AiAdvicePanel key={`${p.id}-${p.ai_plan_at}`} patientId={p.id} name={p.name} saved={p.ai_plan} savedAt={p.ai_plan_at} compact /><PlanReview p={p} /></div>
    </div>
  );
};
export default DoctorPlanDetail;
