import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ActionSheet from "@/components/nurse/ActionSheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScaleAssessments } from "@/data/patients";
import { latestSelfAssessments, selfAssessmentConcerns } from "../../../supabase/functions/_shared/selfAssessment";
import { selfAssessmentTags } from "@/data/selfAssessmentTags";

export default function SelfAssessmentResults({ patientId, readOnly = false }: { patientId: string; readOnly?: boolean }) {
  const { data: records = [], isLoading, isError } = useScaleAssessments(patientId);
  const navigate = useNavigate();
  const [selectedScale, setSelectedScale] = useState<string | null>(null);
  const selected = latestSelfAssessments(records).find(x => x.questionnaire.id === selectedScale);
  return <Card className="p-4 shadow-soft"><h3 className="mb-2 text-sm font-semibold">患者自评量表结果</h3>
    {isLoading ? <p className="text-xs text-muted-foreground">读取中…</p> : isError ? <p className="text-xs text-destructive">自评读取失败，请重试</p> : latestSelfAssessments(records).map(({ questionnaire: q, record }) => {
      const concerns = record ? selfAssessmentConcerns(q, record.items) : [];
      return <section key={q.id} className="border-b py-2 last:border-0"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="text-xs font-medium">{q.name} · {record ? `${record.total} 分` : "未填写"}</p><span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] ${record ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{record ? "已填写" : "待填写"}</span>{record && <p className="mt-1 text-[10px] text-muted-foreground">{new Date(record.created_at).toLocaleDateString("zh-CN")} · {record.assessed_by}</p>}</div>{(!readOnly || record) && <Button size="sm" variant="ghost" className="shrink-0 text-primary" onClick={() => readOnly ? setSelectedScale(q.id) : navigate(`/doctor/self-assess/${patientId}?scale=${q.id}`)}>{record ? "详情" : "协助完成"}</Button>}</div>
        <div className="mt-1 flex flex-wrap gap-1">{readOnly ? selfAssessmentTags(q, record?.items).map(x => <span key={x.id} className="rounded bg-warning/10 px-1.5 py-1 text-[10px] text-warning">{x.label}</span>) : concerns.map(x => <span key={x.id} title={x.question} className="rounded bg-warning/10 px-1.5 py-1 text-[10px] text-warning">{x.question}：{x.answer}</span>)}</div>
        {record && !concerns.length && <p className="mt-1 text-[11px] text-muted-foreground">本份作答无异常问题项</p>}
      </section>;
    })}
    <ActionSheet open={!!selected} onOpenChange={v => !v && setSelectedScale(null)} title="患者自评详情" description={selected?.questionnaire.name}>
      {selected && records.filter(r => r.scale === `self_${selected.questionnaire.id}`).map(r => <section key={r.id} className="mb-4"><p className="mb-2 text-xs font-semibold">{new Date(r.created_at).toLocaleString("zh-CN")} · {r.total} 分</p>{selected.questionnaire.questions.map(q => { const items = r.items as Record<string, number>; const answer = q.options.find(o => o.score === items?.[q.id]); const concern = selfAssessmentConcerns(selected.questionnaire, r.items).some(x => x.id === q.id); return <div key={q.id} className={`mb-2 border-l-2 p-2 text-xs ${concern ? "border-warning bg-warning/5" : "border-border"}`}><p>{q.text}</p><p className={`mt-1 ${concern ? "text-warning" : "text-muted-foreground"}`}>{answer?.label ?? "未记录"}{concern ? " · 问题项" : ""}</p></div>; })}</section>)}
    </ActionSheet>
    </Card>;
}