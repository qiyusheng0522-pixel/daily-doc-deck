import { useEffect, useMemo, useState } from "react";
import { Brain, Activity, Home, Footprints, Smile, Moon, Utensils, ChevronDown, FileText, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useScaleAssessments } from "@/data/patients";
import { assessmentHistory, scaleDefinition } from "@/data/assessmentHistory";
import { AiReading, HistoryList, MetaRows, ResultBlock, ScaleTable, fmtDate, scoreTone, type ScaleRecord } from "./ScaleRecordView";
import { cn } from "@/lib/utils";

const ICON: Record<string, React.ElementType> = { 认知功能: Brain, 生活能力: Home, 安全风险: Footprints, 情绪心理: Smile, 睡眠健康: Moon, 营养状态: Utensils };

/** 「量表评估」页签：左侧各量表最新结果，中间逐项详情，右侧结果/说明/历史（可切换历史记录）。 */
export default function ScaleBrowser({ patientId, initialScale }: { patientId: string; initialScale?: string | null }) {
  const { data: records = [], isLoading } = useScaleAssessments(patientId);
  const all = useMemo(() => assessmentHistory(records), [records]);
  const [scale, setScale] = useState<string | null>(initialScale ?? null);
  const [recordId, setRecordId] = useState<string | null>(null);
  useEffect(() => { if (initialScale) { setScale(initialScale); setRecordId(null); } }, [initialScale]);

  const latest = all.filter((r, i, a) => a.findIndex(x => x.scale === r.scale) === i)
    ;
  const pro = latest.filter(r => r.professional), self = latest.filter(r => !r.professional);
  const activeScale = scale && latest.some(r => r.scale === scale) ? scale : latest[0]?.scale;
  const history = all.filter(r => r.scale === activeScale);
  const r = history.find(h => h.id === recordId) ?? history[0];

  const Item = ({ x }: { x: ScaleRecord }) => { const Icon = ICON[x.category] ?? Activity; return <button type="button" onClick={() => { setScale(x.scale); setRecordId(null); }}
    className={cn("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left", x.scale === activeScale ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/50")}>
    <Icon className="h-5 w-5 shrink-0 text-primary" />
    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{x.name}</span><span className="block text-xs text-muted-foreground">{x.category} | {fmtDate(x.created_at)}</span></span>
    <span className="shrink-0 rounded-md bg-muted/60 px-2 py-0.5 text-sm"><b className={scoreTone(x)}>{x.total}</b>{x.max ? <span className="text-xs text-muted-foreground">/{x.max}</span> : null}</span>
  </button>; };
  const Group = ({ title, list }: { title: string; list: ScaleRecord[] }) => list.length ? <Card className="p-3 shadow-soft"><p className="mb-2 flex items-center gap-1.5 text-base font-semibold"><ChevronDown className="h-4 w-4 text-primary" />{title}<span className="text-sm text-muted-foreground">{list.length}</span></p><div className="space-y-1">{list.map(x => <Item key={x.scale} x={x} />)}</div></Card> : null;

  return <div className="space-y-3">

    {isLoading ? <p className="text-sm text-muted-foreground">加载中…</p> : !r ? <Card className="p-6 text-center text-sm text-muted-foreground">暂无符合条件的量表记录</Card> :
      <div className="grid items-start gap-3 lg:grid-cols-[1fr_1.8fr_1fr]">
        <div className="space-y-3"><Group title="专业评估" list={pro} /><Group title="患者自评" list={self} /></div>
        <Card className="p-4 shadow-soft">
          <p className="flex items-center gap-2 whitespace-nowrap text-lg font-semibold"><Brain className="h-5 w-5 text-primary" />{r.name}</p><p className="mt-1 text-sm text-muted-foreground">{scaleDefinition(r.scale).desc}</p>
          <div className="my-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground"><span>评估日期：{fmtDate(r.created_at)}</span><span>评估人：{r.assessed_by ?? "未记录"}</span><span>{r.professional ? "专业评估" : "患者自评"}</span>{r.id !== history[0]?.id && <span className="text-warning">正在查看历史记录</span>}</div>
          <ScaleTable r={r} />
        </Card>
        <div className="space-y-3">
          <Card className="space-y-3 p-4 shadow-soft">
            <p className="flex items-center gap-1.5 text-base font-semibold"><FileText className="h-4 w-4 text-primary" />评估结果</p>
            <ResultBlock r={r} />
            <div className="border-t pt-3"><p className="mb-1 flex items-center gap-1.5 text-sm font-semibold"><Target className="h-4 w-4 text-primary" />评分与结果判定</p><p className="text-sm leading-relaxed text-muted-foreground">{scaleDefinition(r.scale).criteria ?? "—"}</p></div>
            <AiReading patientId={patientId} r={r} />
          </Card>
          <Card className="p-4 shadow-soft"><HistoryList list={history} activeId={r.id} onPick={setRecordId} /></Card>
          <Card className="p-4 shadow-soft"><MetaRows r={r} /></Card>
        </div>
      </div>}
  </div>;
}
