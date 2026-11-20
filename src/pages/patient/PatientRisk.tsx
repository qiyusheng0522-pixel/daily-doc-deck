import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowRight, ChevronDown, CalendarClock, Target, Lightbulb, ClipboardList, List, CircleAlert } from "lucide-react";
import { useCurrentPatient, useScaleAssessments } from "@/data/patients";
import { latestSelfAssessments } from "../../../supabase/functions/_shared/selfAssessment";
import { selfRiskLabel } from "@/data/selfRisk";
import { cognitiveRiskLevel } from "@/data/homePractice";
import { RISK_PLAN, planConfirmed } from "@/data/cognitive";
import type { Advice } from "@/components/cognitive/AiAdvicePanel";
import { Button } from "@/components/ui/button";
const tones = { "低风险": "bg-success/10 text-success", "中风险": "bg-warning/10 text-warning", "高风险": "bg-destructive/10 text-destructive" };
const descriptions = { "低风险": "目前认知风险较低，继续保持健康生活习惯，并按安排复评。", "中风险": "需要关注认知变化，按方案进行训练，并定期接受专业评估。", "高风险": "需要持续的专业评估与照护支持，请在家属协助下按方案执行。" };
export default function PatientRisk() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("risk-report");
  const { data: patient, isLoading, isError } = useCurrentPatient();
  const { data: records = [], isLoading: loading, isError: recordError } = useScaleAssessments(patient?.id);
  const latest = latestSelfAssessments(records);
  const level = cognitiveRiskLevel(patient?.cognitive_risk);
  const plan = (planConfirmed(patient) ? patient?.ai_plan : null) as Advice | null;
  const concerns = latest.flatMap(({questionnaire:q, record}) => { const result = record ? selfRiskLabel(q.id, record.total) : null; return result && result.level !== "ok" ? [`${q.name}：${result.label}`] : []; });
  if (isLoading || loading) return <p className="p-4 text-sm text-muted-foreground">读取评估结果…</p>;
  if (isError || recordError || !patient) return <p className="p-4 text-sm text-muted-foreground">暂时无法读取评估结果，请稍后重试。</p>;
  return <div className="pb-5">
    <header className="bg-primary px-4 py-5 text-primary-foreground"><p className="text-xs text-primary-foreground/80">{patient.name} · 当前评估结果</p><h2 className="mt-2 text-xl font-semibold">认知健康报告</h2><div className="mt-4 flex items-center gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15"><Brain className="h-7 w-7" /></span><div className="flex-1"><p className="text-xs text-primary-foreground/80">专业评估风险等级</p><p className="mt-1 text-lg font-semibold">{level ?? "待专业评估"}</p></div>{level && <span className="text-xs text-primary-foreground/80">复评周期<br />{RISK_PLAN[level].reassess}</span>}</div></header>
    <section className="sticky top-0 z-20 border-b bg-card"><h3 className="sr-only">健康目录</h3><div className="grid grid-cols-3 px-3">{[["risk-report","认知风险"],["health-results","健康评估"],["health-goals","健康目标"]].map(([id,label]) => <Button key={id} variant="ghost" className={`h-12 rounded-none border-b-2 px-1 text-sm ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`} onClick={() => setTab(id)}>{label}</Button>)}</div></section>
    <div className="px-4 pt-4">
    <section id="risk-report" className={tab === "risk-report" ? "space-y-4" : "hidden"}>
      <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-base font-semibold"><Brain className="h-5 w-5 text-primary" />认知风险评估</h3><span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${level ? tones[level] : "bg-muted text-muted-foreground"}`}>{level ?? "待专业评估"}</span></div>
      <p className="text-xs text-muted-foreground">专业评估风险等级{patient.ai_risk_at ? ` · ${new Date(patient.ai_risk_at).toLocaleDateString("zh-CN")}` : ""}</p>
      <div className="border-l-2 border-destructive/40 pl-3"><h4 className="mb-2 flex items-center gap-2 text-base font-semibold"><CircleAlert className="h-5 w-5 text-destructive" />需关注的问题</h4><p className="text-sm leading-relaxed">{level ? descriptions[level] : "认知风险等级需由专业人员评估后确定，不由自评或游戏成绩推算。"}</p>{!!concerns.length && <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">{concerns.map(text => <li key={text}>{text}</li>)}</ul>}</div>
      <div className="border-t pt-4"><h4 className="mb-2 flex items-center gap-2 text-base font-semibold"><Lightbulb className="h-5 w-5 text-primary" />给您的建议</h4><p className="text-sm leading-relaxed">{plan?.summary || "按社区专业人员的安排完成评估，关注日常状态变化；有疑问时联系医护人员。"}</p>{level && <p className="mt-3 flex items-center gap-2 text-sm text-primary"><CalendarClock className="h-4 w-4 shrink-0" />复评安排：{patient.next_reassess || RISK_PLAN[level].reassess}</p>}</div>
      <div className="rounded-lg bg-muted p-3"><h4 className="flex items-center gap-2 text-sm font-semibold"><ClipboardList className="h-4 w-4" />评估依据</h4><p className="mt-2 text-xs leading-relaxed text-muted-foreground">认知等级来源：专业人员保存的分级；健康评估来源：已保存的自评量表。风险等级不等同于疾病诊断。</p></div>
    </section>
    <section id="health-goals" className={tab === "health-goals" ? "space-y-4" : "hidden"}><h3 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Target className="h-5 w-5 text-success" />需达到的健康目标</h3>{plan?.focus?.length ? <ol className="space-y-3">{plan.focus.map((goal,i) => <li key={i} className="flex gap-3 text-sm"><span className="shrink-0 text-success">目标 {i+1}</span><span>{goal}</span></li>)}</ol> : <p className="text-sm text-muted-foreground">专业人员确认方案后，健康目标将显示在这里。</p>}<Button className="mt-4 w-full" onClick={() => navigate("/patient/plan")}>查看我的居家训练方案<ArrowRight className="ml-2 h-4 w-4" /></Button></section>
    <section id="health-results" className={tab === "health-results" ? "space-y-4" : "hidden"}><h3 className="mb-3 text-lg font-semibold">我的健康评估</h3><div className="space-y-1">{latest.map(({ questionnaire:q, record }) => { const result = record ? selfRiskLabel(q.id,record.total) : null; return <details key={q.id} className="group border-b bg-card py-4"><summary className="flex cursor-pointer list-none items-center gap-2"><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{q.name}</p><p className={`mt-1 text-xs ${result?.level === "high" ? "text-destructive" : result?.level === "warn" ? "text-warning" : "text-muted-foreground"}`}>{result?.label ?? "尚未完成"}</p></div><ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" /></summary>{record ? <div className="mt-3 space-y-2 border-t pt-3"><p className="text-xs text-muted-foreground">{record.total} 分 · {new Date(record.created_at).toLocaleDateString("zh-CN")} · {record.assessed_by}</p>{q.questions.map(question => { const answers = record.items as Record<string,number>; const answer = question.options.find(o => o.score === answers[question.id]); return <p key={question.id} className="text-xs leading-relaxed">{question.text}<span className="block text-primary">{answer?.label ?? "未记录"}</span></p>; })}</div> : <Button className="mt-3" size="sm" onClick={() => navigate("/patient/assessment")}>去完成评估</Button>}</details>; })}</div></section>
    </div>
  </div>;
}
