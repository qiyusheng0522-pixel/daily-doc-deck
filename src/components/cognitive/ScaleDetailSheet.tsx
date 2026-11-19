import { ChevronRight, ClipboardCheck, ListChecks, BookOpen } from "lucide-react";
import ActionSheet from "@/components/nurse/ActionSheet";
import { useScaleAssessments } from "@/data/patients";
import { assessmentHistory, scaleDefinition } from "@/data/assessmentHistory";
import { HistoryList, MetaRows, ResultBlock, ScaleExplain, ScaleTable, SectionTitle } from "./ScaleRecordView";

/** 底部弹出：仅展示该量表最新一次的逐项详情；历史在「量表评估」页签查看。 */
export default function ScaleDetailSheet({ patientId, scale, onClose, onViewHistory }: { patientId: string; scale: string | null; onClose: () => void; onViewHistory?: (scale: string) => void }) {
  const { data: records = [] } = useScaleAssessments(patientId);
  const list = assessmentHistory(records).filter(r => r.scale.toLowerCase() === (scale ?? "").toLowerCase());
  const def = scaleDefinition(scale ?? "");
  const r = list[0];
  const name = r?.name ?? def.scale?.name ?? def.questionnaire?.name ?? scale?.toUpperCase() ?? "";
  return <ActionSheet open={!!scale} onOpenChange={v => !v && onClose()} title={`${name} · 量表填写详情`}>
    {!r ? <p className="text-sm text-muted-foreground">暂无该量表的填写记录</p> :
      <div className="grid gap-3 lg:grid-cols-[1fr_1.7fr_1fr]">
        <div className="space-y-3 rounded-xl border p-3">
          <SectionTitle icon={ClipboardCheck}>评估概览</SectionTitle>
          <MetaRows r={r} />
          <div className="rounded-lg border bg-muted/30 p-3"><p className="mb-1 text-sm font-semibold">评估结果</p><ResultBlock r={r} /></div>
          <div className="rounded-lg border p-3"><HistoryList list={list.slice(0, 3)} title="历史记录" action={onViewHistory && <button type="button" className="flex items-center text-xs text-primary" onClick={() => { onViewHistory(r.scale); onClose(); }}>全部<ChevronRight className="h-3.5 w-3.5" /></button>} /></div>
        </div>
        <div className="rounded-xl border p-3"><SectionTitle icon={ListChecks}>量表详情（共 {r.answers.length} 项）</SectionTitle><ScaleTable r={r} /></div>
        <div className="space-y-3 rounded-xl border p-3"><SectionTitle icon={BookOpen}>量表说明</SectionTitle><ScaleExplain scale={r.scale} /></div>
      </div>}
  </ActionSheet>;
}
