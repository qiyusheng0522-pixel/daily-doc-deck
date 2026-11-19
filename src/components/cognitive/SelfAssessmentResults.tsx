import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ActionSheet from "@/components/nurse/ActionSheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScaleAssessments } from "@/data/patients";
import { latestSelfAssessments, selfAssessmentConcerns } from "../../../supabase/functions/_shared/selfAssessment";

export default function SelfAssessmentResults({ patientId, readOnly = false }: { patientId: string; readOnly?: boolean }) {
  const { data: records = [], isLoading, isError } = useScaleAssessments(patientId);
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const detail = latestSelfAssessments(records).find(x => x.questionnaire.id === selected);
  return <><Card className="p-4 shadow-soft"><h3 className="mb-2 text-sm font-semibold">患者自评量表结果</h3>
    {isLoading ? <p className="text-xs text-muted-foreground">读取中…</p> : isError ? <p className="text-xs text-destructive">自评读取失败，请重试</p> : latestSelfAssessments(records).map(({ questionnaire: q, record }) => {
      const concerns = record ? selfAssessmentConcerns(q, record.items) : [];
      return <section key={q.id} className="border-b py-2 last:border-0"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="text-xs font-medium">{q.name} · {record ? `${record.total} 分` : "未填写"}</p><span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] ${record ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{record ? "已填写" : "待填写"}</span>{record && <p className="mt-1 text-[10px] text-muted-foreground">{new Date(record.created_at).toLocaleDateString("zh-CN")} · {record.assessed_by}</p>}</div>{(!readOnly || record) && <Button size="sm" variant="ghost" className="shrink-0 text-primary" onClick={() => readOnly ? setSelected(q.id) : navigate(`/doctor/self-assess/${patientId}?scale=${q.id}`)}>{record ? "详情" : "协助完成"}</Button>}</div>
        <div className="mt-1 flex flex-wrap gap-1">{concerns.map(x => <span key={x.id} title={x.question} className="rounded bg-warning/10 px-1.5 py-1 text-[10px] text-warning">{x.question}：{x.answer}</span>)}</div>
        {record && !concerns.length && <p className="mt-1 text-[11px] text-muted-foreground">本份作答无异常问题项</p>}
      </section>;
    })}</Card>{detail?.record && <ActionSheet open onOpenChange={open => !open && setSelected(null)} title={`${detail.questionnaire.name} · 作答详情`} description={`${detail.record.total} 分 · ${new Date(detail.record.created_at).toLocaleDateString("zh-CN")}`}>
      <div className="space-y-2">{detail.questionnaire.questions.map(q => {
        const items = detail.record?.items as Record<string, number> | undefined;
        const answer = q.options.find(o => o.score === items?.[q.id]);
        return <section key={q.id} className="border-b py-2 text-xs"><p className="font-medium">{q.text}</p><p className="mt-1 text-muted-foreground">{answer ? `${answer.label} · ${answer.score} 分` : "缺少作答"}</p></section>;
      })}</div>
    </ActionSheet>}</>;
}