import { useNavigate } from "react-router-dom";
import { Brain, ArrowRight, ChevronDown, CalendarClock } from "lucide-react";
import { useCurrentPatient, useScaleAssessments } from "@/data/patients";
import { latestSelfAssessments } from "../../../supabase/functions/_shared/selfAssessment";
import { selfRiskLabel } from "@/data/selfRisk";
import { cognitiveRiskLevel } from "@/data/homePractice";
import { RISK_PLAN } from "@/data/cognitive";
import { Button } from "@/components/ui/button";
const tones = { "低风险": "bg-success/10 text-success", "中风险": "bg-warning/10 text-warning", "高风险": "bg-destructive/10 text-destructive" };
const descriptions = { "低风险": "目前认知风险较低，继续保持健康生活习惯，并按安排复评。", "中风险": "需要关注认知变化，按方案进行训练，并定期接受专业评估。", "高风险": "需要持续的专业评估与照护支持，请在家属协助下按方案执行。" };
export default function PatientRisk() {
  const navigate = useNavigate();
  const { data: patient, isLoading, isError } = useCurrentPatient();
  const { data: records = [], isLoading: loading, isError: recordError } = useScaleAssessments(patient?.id);
  const latest = latestSelfAssessments(records);
  const level = cognitiveRiskLevel(patient?.cognitive_risk);
  if (isLoading || loading) return <p className="p-4 text-sm text-muted-foreground">读取评估结果…</p>;
  if (isError || recordError || !patient) return <p className="p-4 text-sm text-muted-foreground">暂时无法读取评估结果，请稍后重试。</p>;
  return <div className="space-y-5 p-4">
    <section className="border-b pb-5"><p className="text-sm text-muted-foreground">{patient.name} · 当前评估结果</p><h2 className="mt-1 text-2xl font-bold">我的认知风险</h2><div className={`mt-4 flex items-center gap-3 rounded-lg p-4 ${level ? tones[level] : "bg-muted text-muted-foreground"}`}><Brain className="h-9 w-9 shrink-0" /><div><p className="text-xs">专业评估风险等级</p><p className="text-xl font-bold">{level ?? "待专业评估"}</p></div></div><p className="mt-3 text-sm leading-relaxed">{level ? descriptions[level] : "自评已保存的结果会显示在下方；认知风险等级需由专业人员评估后确定，不由自评或游戏成绩推算。"}</p><p className="mt-2 text-xs text-muted-foreground">风险等级不等同于疾病诊断。</p>{level && <p className="mt-3 flex items-center gap-2 text-sm text-primary"><CalendarClock className="h-4 w-4" />复评安排：{patient.next_reassess || RISK_PLAN[level].reassess}</p>}</section>
    <section><h3 className="mb-3 text-lg font-semibold">我的健康评估</h3><div className="space-y-2">{latest.map(({ questionnaire:q, record }) => { const result = record ? selfRiskLabel(q.id,record.total) : null; return <details key={q.id} className="rounded-lg border bg-card p-3"><summary className="flex cursor-pointer list-none items-center gap-2"><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{q.name}</p><p className={`mt-1 text-xs ${result?.level === "high" ? "text-destructive" : result?.level === "warn" ? "text-warning" : "text-muted-foreground"}`}>{result?.label ?? "尚未完成"}</p></div><ChevronDown className="h-4 w-4 text-muted-foreground" /></summary>{record ? <div className="mt-3 space-y-2 border-t pt-3"><p className="text-xs text-muted-foreground">{record.total} 分 · {new Date(record.created_at).toLocaleDateString("zh-CN")} · {record.assessed_by}</p>{q.questions.map(question => { const answers = record.items as Record<string,number>; const answer = question.options.find(o => o.score === answers[question.id]); return <p key={question.id} className="text-xs leading-relaxed">{question.text}<span className="block text-primary">{answer?.label ?? "未记录"}</span></p>; })}</div> : <Button className="mt-3" size="sm" onClick={() => navigate("/patient/assessment")}>去完成评估</Button>}</details>; })}</div></section>
    <Button className="w-full" onClick={() => navigate("/patient/plan")}>查看我的居家训练方案<ArrowRight className="ml-2 h-4 w-4" /></Button>
  </div>;
}
