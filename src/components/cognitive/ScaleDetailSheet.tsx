import ActionSheet from "@/components/nurse/ActionSheet";
import { useScaleAssessments } from "@/data/patients";
import { assessmentHistory } from "@/data/assessmentHistory";

/** 底部弹出：某一量表的填写详情（最新在前，逐项作答）。 */
export default function ScaleDetailSheet({ patientId, scale, onClose }: { patientId: string; scale: string | null; onClose: () => void }) {
  const { data: records = [] } = useScaleAssessments(patientId);
  const list = assessmentHistory(records).filter(r => r.scale.toLowerCase() === (scale ?? "").toLowerCase());
  return <ActionSheet open={!!scale} onOpenChange={v => !v && onClose()} title={`${list[0]?.name ?? scale?.toUpperCase() ?? ""} · 量表填写详情`} description={list.length ? `共 ${list.length} 次评估` : undefined}>
    {!list.length ? <p className="text-sm text-muted-foreground">暂无该量表的逐项填写记录</p> : list.map((r, i) => <details key={r.id} open={i === 0} className="mb-3 border-b pb-3">
      <summary className="cursor-pointer text-xs font-semibold">{new Date(r.created_at).toLocaleString("zh-CN")} · <span className="text-primary">{r.total}{r.max ? ` / ${r.max}` : ""} 分</span> · {r.assessed_by ?? "未记录"}</summary>
      {r.answers.length === 0 ? <p className="mt-2 text-xs text-muted-foreground">此记录仅保存总分</p> : <div className="mt-2 space-y-1.5">{r.answers.map((a, j) => <div key={j} className="rounded border-l-2 border-border p-2 text-xs"><p>{j + 1}. {a.question}</p><p className="mt-0.5 text-primary">{a.answer}{a.score !== null && a.answer !== String(a.score) ? `（${a.score} 分）` : a.score !== null ? " 分" : ""}</p></div>)}</div>}
    </details>)}
  </ActionSheet>;
}
