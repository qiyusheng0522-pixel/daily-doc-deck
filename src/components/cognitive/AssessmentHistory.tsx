import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ActionSheet from "@/components/nurse/ActionSheet";
import { useScaleAssessments } from "@/data/patients";
import { assessmentHistory } from "@/data/assessmentHistory";

export default function AssessmentHistory({ patientId }: { patientId: string }) {
  const { data: records = [], isLoading } = useScaleAssessments(patientId);
  const history = assessmentHistory(records);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = history.find(r => r.id === selectedId);
  return <Card className="p-4 shadow-soft"><h3 className="mb-2 text-sm font-semibold">历史量表记录 <span className="text-xs font-normal text-muted-foreground">({history.length})</span></h3>
    {isLoading ? <p className="text-xs text-muted-foreground">加载中…</p> : !history.length ? <p className="text-xs text-muted-foreground">暂无历史评估</p> : history.map(r => <div key={r.id} className="flex items-center justify-between gap-2 border-b py-2 last:border-0"><div className="min-w-0"><p className="text-xs font-medium">{r.name} · {r.total}{r.max ? ` / ${r.max}` : ""} 分</p><p className="mt-1 text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleString("zh-CN")} · {r.assessed_by ?? "未记录"}</p></div><Button size="sm" variant="ghost" className="shrink-0 text-primary" onClick={() => setSelectedId(r.id)}>查看详情</Button></div>)}
    <ActionSheet open={!!selected} onOpenChange={v => !v && setSelectedId(null)} title="历史量表详情" description={selected ? `${selected.name} · ${selected.total} 分` : ""}>{selected && <div className="space-y-2">{selected.answers.map((a, i) => <div key={i} className="border-b py-2 text-xs"><p className="font-medium">{a.question}</p><p className="mt-1 text-muted-foreground">{a.answer}{a.score !== null ? ` · ${a.score} 分` : ""}</p></div>)}</div>}</ActionSheet>
  </Card>;
}