import { useState } from "react";
import { Loader2, Bot, CalendarDays, UserRound, ClipboardList, Lightbulb, History, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { assessmentHistory, scaleDefinition, binaryDirection } from "@/data/assessmentHistory";
import { scalePresentation, type PresentedScale } from "@/data/scalePresentation";
import { cn } from "@/lib/utils";

export type ScaleRecord = ReturnType<typeof assessmentHistory>[number];
type Reading = { summary: string; findings: { item: string; note: string }[]; strengths: string[]; suggestions: string[]; caution: string };

const fmtDate = (s: string) => new Date(s).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
export { fmtDate };

/** 分值的参考说明：仅对已有参考区间的量表给标签，其余不编造分级。 */
export function resultLabel(r: ScaleRecord): { label: string; tone: string } | null {
  const k = r.scale.toLowerCase();
  if (!["ad8", "mmse", "moca", "scd_q9", "adl"].includes(k)) return null;
  const p = scalePresentation(k as PresentedScale, r.total);
  return { label: p.label, tone: { neutral: "bg-muted text-muted-foreground", low: "bg-success/15 text-success", medium: "bg-warning/15 text-warning", high: "bg-destructive/15 text-destructive" }[p.tone] };
}
export const scoreTone = (r: ScaleRecord) => { const t = resultLabel(r)?.tone; return t ? t.split(" ").find(c => c.startsWith("text-")) : "text-primary"; };

export function ScaleTable({ r }: { r: ScaleRecord }) {
  const dir = binaryDirection(r.scale);
  if (!r.answers.length) return <p className="py-6 text-center text-sm text-muted-foreground">此记录仅保存总分</p>;
  return <div className="overflow-hidden rounded-lg border text-sm">
    <div className="grid grid-cols-[3rem_1fr_7rem_4rem] bg-primary/10 font-semibold"><span className="p-2 text-center">序号</span><span className="p-2 text-center">评估内容</span><span className="p-2 text-center">作答</span><span className="p-2 text-center">得分</span></div>
    {r.answers.map((a, i) => {
      const bin = dir && (a.score === 0 || a.score === 1);
      const bad = bin && (dir === "good" ? a.score === 0 : a.score === 1);
      const cell = bin ? (bad ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success") : "";
      const newGroup = a.group && a.group !== r.answers[i - 1]?.group;
      return <div key={i}>
        {newGroup && <div className="border-t bg-muted/50 px-3 py-1.5 text-xs font-semibold text-primary">{a.group}</div>}
        <div className="grid grid-cols-[3rem_1fr_7rem_4rem] border-t">
          <span className="p-2 text-center text-muted-foreground">{i + 1}</span>
          <span className="p-2 leading-snug">{a.group ? a.question.replace(`${a.group} · `, "") : a.question}</span>
          <span className={cn("p-2 text-center", cell)}>{a.answer}</span>
          <span className={cn("p-2 text-center font-semibold", cell)}>{a.score ?? "—"}</span>
        </div>
      </div>;
    })}
  </div>;
}

export function ResultBlock({ r }: { r: ScaleRecord }) {
  const l = resultLabel(r);
  return <div>
    <p className="flex items-baseline gap-1"><span className={cn("text-4xl font-bold", scoreTone(r))}>{r.total}</span><span className="text-sm text-muted-foreground">{r.max ? `/ ${r.max} 分` : "分"}</span>{l && <span className={cn("ml-2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold", l.tone)}>{l.label}</span>}</p>
  </div>;
}

export function MetaRows({ r }: { r: ScaleRecord }) {
  return <div className="space-y-1.5 text-sm">
    <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /><span className="shrink-0 whitespace-nowrap text-muted-foreground">评估日期</span>{fmtDate(r.created_at)}</p>
    <p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-muted-foreground" /><span className="shrink-0 whitespace-nowrap text-muted-foreground">评估人</span>{r.assessed_by ?? "未记录"}</p>
    <p className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-muted-foreground" /><span className="shrink-0 whitespace-nowrap text-muted-foreground">评估方式</span>{r.professional ? "专业评估" : "患者自评"}</p>
  </div>;
}

export function ScaleExplain({ scale }: { scale: string }) {
  const def = scaleDefinition(scale);
  return <div className="space-y-2">
    <div className="rounded-lg border bg-muted/30 p-3"><p className="mb-1 text-sm font-semibold">量表简介</p><p className="text-sm leading-relaxed text-muted-foreground">{def.desc ?? "—"}</p></div>
    <div className="rounded-lg border bg-muted/30 p-3"><p className="mb-1 text-sm font-semibold">评分与结果判定</p><p className="text-sm leading-relaxed text-muted-foreground">{def.criteria ?? "—"}</p></div>
  </div>;
}

export function HistoryList({ list, activeId, onPick, title = "历史评估记录", action }: { list: ScaleRecord[]; activeId?: string; onPick?: (id: string) => void; title?: string; action?: React.ReactNode }) {
  return <div>
    <div className="mb-2 flex items-center justify-between"><p className="flex items-center gap-1.5 text-sm font-semibold"><History className="h-4 w-4 text-primary" />{title}（{list.length}）</p>{action}</div>
    <div className="relative space-y-0.5 pl-4 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-border">
      {list.map((h, i) => <button key={h.id} type="button" disabled={!onPick} onClick={() => onPick?.(h.id)} className={cn("relative flex w-full items-center justify-between rounded-md px-2 py-1 text-sm", onPick && "hover:bg-muted/60", h.id === activeId && "bg-primary/10")}>
        <span className={cn("absolute -left-[15px] h-2.5 w-2.5 rounded-full", i === 0 ? "bg-primary" : "bg-primary/40")} />
        <span>{fmtDate(h.created_at)}</span><span><b className={scoreTone(h)}>{h.total}</b>{h.max ? <span className="text-muted-foreground">/{h.max}</span> : null}</span>
      </button>)}
    </div>
  </div>;
}

/** 通用大模型解读（不保存，不作诊断）。 */
export function AiReading({ patientId, r }: { patientId: string; r: ScaleRecord }) {
  const [readings, setReadings] = useState<Record<string, Reading | string>>({});
  const [loading, setLoading] = useState(false);
  const def = scaleDefinition(r.scale);
  const reading = readings[r.id];
  const read = async () => {
    setLoading(true);
    const items = { 总分: `${r.total}${r.max ? `/${r.max}` : ""}`, 评分标准: def.criteria ?? "", 日期: r.created_at, 逐项: r.answers.map(a => `${a.group ? a.group + "｜" : ""}${a.question}：${a.answer}${a.score !== null ? `（${a.score}分）` : ""}`) };
    const { data, error } = await supabase.functions.invoke("cognitive-advice", { body: { patientId, mode: "scale", scaleName: `${r.name}（${def.desc ?? ""}）`, items } });
    setLoading(false);
    setReadings(x => ({ ...x, [r.id]: error || data?.error ? (data?.error ?? "解读失败，请稍后重试") : data.reading }));
  };
  return <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
    <div className="flex items-center justify-between gap-2"><p className="flex items-center gap-1 font-semibold text-primary"><Bot className="h-4 w-4" />智能解读</p>
      {(!reading || typeof reading === "string") && <Button size="sm" variant="outline" className="h-7 text-xs" disabled={loading} onClick={read}>{loading ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />解读中</> : "生成解读"}</Button>}</div>
    {typeof reading === "string" && <p className="mt-1 text-destructive">{reading}</p>}
    {reading && typeof reading !== "string" && <div className="mt-1.5 space-y-1.5 leading-relaxed">
      <p>{reading.summary}</p>
      {reading.findings.length > 0 && <div><p className="font-medium">失分 / 异常条目</p>{reading.findings.map((f, k) => <p key={k} className="text-muted-foreground">· {f.item}：{f.note}</p>)}</div>}
      {reading.suggestions.length > 0 && <div><p className="flex items-center gap-1 font-medium"><Lightbulb className="h-3.5 w-3.5" />建议</p>{reading.suggestions.map((s, k) => <p key={k} className="text-muted-foreground">{k + 1}. {s}</p>)}</div>}
      <p className="text-xs text-muted-foreground">{reading.caution}</p>
    </div>}
    {!reading && <p className="mt-1 text-xs text-muted-foreground">由通用大模型根据本次逐项作答生成，仅供参考，不作诊断。</p>}
  </div>;
}

export const SectionTitle = ({ icon: Icon = BookOpen, children }: { icon?: React.ElementType; children: React.ReactNode }) =>
  <p className="mb-3 flex items-center gap-1.5 border-b pb-2 text-base font-semibold"><Icon className="h-4 w-4 text-primary" />{children}</p>;
