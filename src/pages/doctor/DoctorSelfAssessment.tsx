import { useParams, useSearchParams } from "react-router-dom";
import DoctorBackButton from "@/components/doctor/DoctorBackButton";
import { Button } from "@/components/ui/button";
import { usePatient, useScaleAssessments } from "@/data/patients";
import SelfAssessmentForm from "@/components/cognitive/SelfAssessmentForm";
import { SELF_QUESTIONNAIRES, selfAssessmentConcerns } from "../../../supabase/functions/_shared/selfAssessment";

export default function DoctorSelfAssessment() {
  const { id = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const { data: p } = usePatient(id);
  const { data: records = [] } = useScaleAssessments(id);
  const q = SELF_QUESTIONNAIRES.find(x => x.id === params.get("scale")) ?? SELF_QUESTIONNAIRES[0];
  const history = records.filter(r => r.scale === `self_${q.id}`);
  return <div className="min-h-full bg-background"><header className="sticky top-0 z-10 flex items-center gap-2 border-b bg-card p-3"><DoctorBackButton fallback={`/doctor/patients/${id}`} /><h2 className="text-sm font-semibold">{p?.name} · 自评详情</h2></header>
    <div className="space-y-4 p-3"><div className="grid grid-cols-2 gap-2">{SELF_QUESTIONNAIRES.map(x => <Button key={x.id} size="sm" variant={q.id === x.id ? "default" : "outline"} onClick={() => setParams({ scale: x.id }, { replace: true })}>{x.name}</Button>)}</div>
      <h3 className="text-sm font-semibold">{q.name} · 历史作答 ({history.length})</h3>
      {!history.length && <p className="text-xs text-muted-foreground">暂无结果，请医生协助患者完成。</p>}
      {history.map((r, i) => <details key={r.id} open={i === 0} className="border-b pb-3"><summary className="cursor-pointer text-xs font-medium">{new Date(r.created_at).toLocaleString("zh-CN")} · {r.total} 分 · {r.assessed_by}</summary><div className="mt-2 space-y-2">{q.questions.map(item => { const option = item.options.find(o => o.score === (r.items as Record<string, number>)?.[item.id]); const abnormal = selfAssessmentConcerns(q, r.items).some(x => x.id === item.id); return <div key={item.id} className={`border-l-2 p-2 text-xs ${abnormal ? "border-warning bg-warning/5" : "border-border"}`}><p>{item.text}</p><p className={abnormal ? "mt-1 text-warning" : "mt-1 text-muted-foreground"}>{option ? `${option.label} · ${option.score} 分` : "缺少作答"}{abnormal && " · 问题项"}</p></div>; })}</div></details>)}
      <SelfAssessmentForm patientId={id} assisted />
    </div></div>;
}