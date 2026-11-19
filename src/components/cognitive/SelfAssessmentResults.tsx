import { useScaleAssessments } from "@/data/patients";
import { Card } from "@/components/ui/card";
import { latestSelfAssessments } from "../../../supabase/functions/_shared/selfAssessment";

export default function SelfAssessmentResults({ patientId }: { patientId: string }) {
  const { data: records = [], isLoading, isError } = useScaleAssessments(patientId);
  return <Card className="p-4 shadow-soft">
    <h3 className="mb-2 text-sm font-semibold">患者自评量表结果</h3>
    {isLoading ? <p className="text-xs text-muted-foreground">读取中…</p> : isError ? <p className="text-xs text-destructive">自评结果读取失败</p> : latestSelfAssessments(records).map(({ questionnaire: q, record }) => <section key={q.id} className="border-b py-2 last:border-0"><details>
      <summary className="cursor-pointer text-sm font-medium">{q.name} <span className="text-xs text-primary">{record ? `${record.total} 分 · 查看详情` : "暂无评估"}</span></summary>
      {record && <p className="mt-1 text-[11px] text-muted-foreground">{new Date(record.created_at).toLocaleString("zh-CN")} · {record.assessed_by} · 简版问卷，非诊断结论</p>}
      {record && <div className="mt-2 space-y-2 text-xs">{q.questions.map((item, i) => <p key={item.id}>{i + 1}. {item.text}<br /><span className="text-muted-foreground">{item.options.find(o => o.score === (record.items as Record<string, number>)[item.id])?.label} · {(record.items as Record<string, number>)[item.id]} 分</span></p>)}</div>}
      </details><div className="mt-2 flex flex-wrap gap-1.5">{q.questions.map(item => {
        const value = record ? (record.items as Record<string, number>)[item.id] : undefined;
        const answer = item.options.find(o => o.score === value);
        return <span key={item.id} className="max-w-full break-words rounded bg-primary/5 px-2 py-1 text-[11px] text-foreground">{item.text}：{answer?.label ?? "未作答"}</span>;
      })}</div>
    </section>)}
  </Card>;
}