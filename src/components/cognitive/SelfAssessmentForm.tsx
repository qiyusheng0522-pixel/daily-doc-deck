import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useScaleAssessments } from "@/data/patients";
import { SELF_QUESTIONNAIRES, latestSelfAssessments, questionnaireTotal, selfAssessmentConcerns } from "../../../supabase/functions/_shared/selfAssessment";

export default function SelfAssessmentForm({ patientId, assisted = false }: { patientId: string; assisted?: boolean }) {
  const qc = useQueryClient();
  const { data: records = [], isLoading } = useScaleAssessments(patientId);
  const [active, setActive] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [filler, setFiller] = useState("本人");
  const latest = latestSelfAssessments(records);
  const current = SELF_QUESTIONNAIRES.find(q => q.id === active);
  const save = async () => {
    if (!current) return;
    const total = questionnaireTotal(current, answers);
    if (total === null) return;
    setSaving(true);
    const { error } = await supabase.from("scale_assessments").insert({ patient_id: patientId, scale: `self_${current.id}`, items: answers, total, assessed_by: assisted ? "医生协助患者" : filler });
    setSaving(false);
    if (error) return toast({ title: "保存失败", description: error.message });
    await qc.invalidateQueries({ queryKey: ["scale-assessments", patientId] });
    setActive(null); setAnswers({});
    toast({ title: "自评已保存", description: `${current.name} · ${total} 分` });
  };
  if (isLoading) return <p className="text-sm text-muted-foreground">读取自评记录…</p>;
  if (current) return <div className="space-y-3">
    <div className="flex items-center justify-between"><h3 className="font-semibold">{current.name}</h3><Button variant="ghost" size="sm" onClick={() => setActive(null)}>返回列表</Button></div>
    <p className="text-xs text-muted-foreground">{assisted ? "医生协助患者逐题作答" : "老年综合评估自评"} · 简版问卷（非正式诊断量表）</p>
    {!assisted && <div className="flex gap-2">{["本人", "家属协助"].map(f => <Button key={f} size="sm" variant={filler === f ? "default" : "outline"} onClick={() => setFiller(f)}>{f}</Button>)}</div>}
    {current.questions.map((q, i) => <section key={q.id} className="border-b pb-3">
      <p className="mb-2 text-sm font-medium">{i + 1}. {q.text}</p>
      <div className="grid grid-cols-2 gap-2">{q.options.map(o => <Button key={o.label} variant={answers[q.id] === o.score ? "default" : "outline"} className="h-auto min-h-10 whitespace-normal text-xs" onClick={() => setAnswers({ ...answers, [q.id]: o.score })}>{o.label}</Button>)}</div>
    </section>)}
    <Button className="w-full" disabled={saving || questionnaireTotal(current, answers) === null} onClick={save}>{saving ? "保存中…" : "保存本份评估"}</Button>
  </div>;
  return <div className="space-y-2">
    <p className="text-sm font-semibold">自评量表 · {latest.filter(x => x.record).length}/4 已完成</p>
    {latest.map(({ questionnaire: q, record }) => <section key={q.id} className="border-b py-2">
      <div className="flex items-center justify-between gap-2"><p className="text-sm font-medium">{q.name}</p><Button size="sm" variant="outline" onClick={() => { setActive(q.id); setAnswers({}); }}>{record ? "重新评估" : assisted ? "协助完成" : "开始自评"}</Button></div>
      <p className="mt-1 text-xs text-muted-foreground">{record ? `${record.total} 分 · ${new Date(record.created_at).toLocaleString("zh-CN")} · ${record.assessed_by ?? "未登记"}` : "暂无数据"}</p>
      {record && (() => { const concerns = selfAssessmentConcerns(q, record.items); return concerns.length
        ? <div className="mt-1 flex flex-wrap gap-1">{concerns.map(x => <span key={x.id} title={x.question} className="rounded bg-warning/10 px-1.5 py-1 text-[10px] text-warning">{x.question}：{x.answer}</span>)}</div>
        : <p className="mt-1 text-[11px] text-muted-foreground">本份作答无异常问题项</p>; })()}
    </section>)}
  </div>;
}