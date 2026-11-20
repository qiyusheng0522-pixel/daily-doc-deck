import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Brain, ArrowRight, CalendarDays } from "lucide-react";
import { useCurrentPatient } from "@/data/patients";
import { planConfirmed } from "@/data/cognitive";
import type { Advice } from "@/components/cognitive/AiAdvicePanel";
import { familyPlanTasks } from "@/data/familyTasks";
import FamilyTasks from "@/components/patient/FamilyTasks";
import { Button } from "@/components/ui/button";
export default function PatientPlan() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("training");
  const { data: patient, isLoading, isError } = useCurrentPatient();
  const plan = (planConfirmed(patient) ? patient?.ai_plan : null) as Advice | null;
  const tasks = familyPlanTasks(patient);
  if (isLoading) return <p className="p-4 text-sm text-muted-foreground">读取方案…</p>;
  if (isError || !patient) return <p className="p-4 text-sm text-muted-foreground">暂时无法读取方案，请稍后重试。</p>;
  return <div className="space-y-5 pb-5">
    <section className="bg-primary/5 px-4 py-5"><p className="text-sm text-muted-foreground">{patient.name} · {patient.cognitive_risk ?? "待专业评估"}</p><h2 className="mt-1 text-2xl font-bold">我的居家训练方案</h2>{plan ? <><details className="mt-3"><summary className="cursor-pointer text-sm text-primary">方案概览</summary><p className="mt-2 text-sm leading-relaxed">{plan.summary}</p></details><p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-4 w-4" />{plan.followup?.cycle ?? "按方案安排"}{patient.ai_plan_at ? ` · 更新于 ${new Date(patient.ai_plan_at).toLocaleDateString("zh-CN")}` : ""}</p></> : <p className="mt-3 text-sm text-muted-foreground">{patient.ai_plan ? "方案正在等待医生确认，确认后可查看并执行。" : "暂无居家训练方案，专业人员制定后会显示在这里。"}</p>}</section>
    {plan && <><div className="grid grid-cols-3 border-b px-4">{[["training","训练方案"],["tasks","练习打卡"],["care","生活照护"]].map(([key,label]) => <Button key={key} variant="ghost" className={`rounded-none border-b-2 px-1 text-sm ${tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`} onClick={() => setTab(key)}>{label}</Button>)}</div><div className="px-4"><div className={tab === "training" ? "space-y-5" : "hidden"}><section className="space-y-3 border-b pb-5"><h3 className="flex items-center gap-2 text-lg font-semibold"><Target className="h-5 w-5 text-primary" />训练目标</h3>{plan.focus?.length ? <ul className="space-y-2">{plan.focus.map((focus,i) => <li key={i} className="flex gap-2 text-sm"><span className="text-primary">{i+1}.</span><span>{focus}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">方案暂未单独列出训练目标。</p>}</section>
    <section className="space-y-3"><h3 className="flex items-center gap-2 text-lg font-semibold"><Brain className="h-5 w-5 text-primary" />详细居家训练</h3>{tasks.filter(t => t.category === "训练").map(t => <article key={t.key} className="space-y-2 rounded-lg border bg-card p-3"><p className="text-base font-semibold">居家认知训练</p><details><summary className="cursor-pointer text-sm text-primary">训练内容与执行要求</summary><p className="mt-2 text-sm leading-relaxed">{t.title}</p></details><p className="text-sm text-primary">{t.frequency} · {t.duration || "按方案安排"}</p></article>)}{!tasks.some(t => t.category === "训练") && <p className="text-sm text-muted-foreground">当前方案未安排居家认知训练。</p>}</section>
    </div><div className={tab === "care" ? "space-y-5" : "hidden"}>{!!plan.interventions?.filter(x => ["营养","睡眠"].includes(x.category)).length && <section className="space-y-3 border-t pt-4"><h3 className="text-lg font-semibold">居家生活安排</h3>{plan.interventions.filter(x => ["营养","睡眠"].includes(x.category)).map((item,i) => <article className="rounded-lg border p-3" key={i}><h4 className="text-sm font-semibold">{item.category} · {item.frequency} · {item.duration}</h4><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">{item.actions.map((action,j) => <li key={j}>{action}</li>)}</ul></article>)}</section>}
    {!!plan.caregiver_tips?.length && <section className="border-t pt-4"><h3 className="mb-2 text-lg font-semibold">家属协助</h3><ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">{plan.caregiver_tips.map((tip,i) => <li key={i}>{tip}</li>)}</ul></section>}
    {!!plan.red_flags?.length && <section className="border-t pt-4"><h3 className="mb-2 text-base font-semibold text-destructive">需要及时联系医护的情况</h3><ul className="list-disc space-y-1 pl-4 text-sm">{plan.red_flags.map((flag,i) => <li key={i}>{flag}</li>)}</ul></section>}
    </div><section className={tab === "tasks" ? "space-y-3" : "hidden"}><h3 className="text-lg font-semibold">游戏、专项训练与打卡</h3><FamilyTasks /></section></div></>}
    <div className="px-4"><Button variant="outline" className="w-full" onClick={() => navigate("/patient/risk")}>查看我的评估结果<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
  </div>;
}
