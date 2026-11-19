import { useState } from "react";
import { Brain, Crosshair, Route, Images, Grid3x3, ShoppingCart, Monitor, PersonStanding, CalendarDays, BarChart3, CheckCircle2, Clock, Dumbbell, Plus, Compass, MessageSquare, Calculator, Lightbulb, Shapes } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Rec = { id: string; trained_on: string; training_time?: string | null; domain: string; activity: string; setting: string; duration_min: number; completion: string; feedback?: string | null; record_type?: string | null };

/** 设备训练完成率：正确率 X% 或 完成 a/b 关；非设备按「完成」计。 */
export function deviceScore(feedback?: string | null): number | null {
  if (!feedback) return null;
  const pct = feedback.match(/正确率\s*(\d+(?:\.\d+)?)\s*%/);
  if (pct) return Number(pct[1]);
  const frac = feedback.match(/(\d+)\s*\/\s*(\d+)/);
  return frac && Number(frac[2]) > 0 ? Math.round((Number(frac[1]) / Number(frac[2])) * 100) : null;
}
export function completionRate(rows: Rec[], device: boolean): number | null {
  if (!rows.length) return null;
  if (device) { const s = rows.map(r => deviceScore(r.feedback)).filter((x): x is number => x != null); return s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : null; }
  return Math.round((rows.filter(r => r.completion === "完成").length / rows.length) * 100);
}

const iconFor = (r: Rec) => {
  const t = `${r.domain}${r.activity}`;
  if (/买菜|购物/.test(t)) return ShoppingCart;
  if (/路径|规划/.test(t)) return Route;
  if (/图片|配对/.test(t)) return Images;
  if (/划消|数字/.test(t)) return Grid3x3;
  if (/视觉|搜索|注意/.test(t)) return Crosshair;
  if (/定向/.test(t)) return Compass;
  if (/语言/.test(t)) return MessageSquare;
  if (/计算/.test(t)) return Calculator;
  if (/执行|逻辑/.test(t)) return Lightbulb;
  if (/视空间/.test(t)) return Shapes;
  return Brain;
};

function Ring({ value, label }: { value: number | null; label: string }) {
  const v = value ?? 0, r = 22, c = 2 * Math.PI * r;
  return <div className="flex items-center gap-2">
    <div className="relative h-14 w-14"><svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90"><circle cx="28" cy="28" r={r} className="fill-card stroke-muted" strokeWidth="5" /><circle cx="28" cy="28" r={r} className="fill-none stroke-success" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(c * v) / 100} ${c}`} /></svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{value == null ? "—" : `${value}%`}</span></div>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>;
}

function Row({ r, device }: { r: Rec; device: boolean }) {
  const Icon = iconFor(r);
  const done = r.completion === "完成";
  return <div className="flex gap-4 border-b py-3 last:border-0">
    <div className={cn("flex h-16 w-24 shrink-0 items-center justify-center rounded-lg", device ? "bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-soft" : "bg-muted/70 text-primary")}><Icon className="h-8 w-8" /></div>
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2"><p className="truncate text-base font-semibold">{r.domain} · {r.activity.length > 18 && !device ? r.activity.slice(0, 18) + "…" : r.activity}</p>
        <span className={cn("flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", done ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>{done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}{done ? "已完成" : r.completion}</span></div>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{r.trained_on}{r.training_time ? ` ${r.training_time.slice(0, 5)}` : ""}<span className="mx-1 text-border">|</span>{r.duration_min} 分钟{!device && ` · ${r.setting}`}</p>
      {r.feedback && <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">{device && <BarChart3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />}<span className="break-words">{device ? `训练结果：${r.feedback}` : r.feedback}</span></p>}
    </div>
  </div>;
}

const PERIODS = [["30", "近1个月"], ["90", "近3个月"], ["all", "全部"]] as const;

export default function TrainingRecords({ trainings, onAdd }: { trainings: Rec[]; onAdd?: () => void }) {
  const [period, setPeriod] = useState<string>("30");
  const since = period === "all" ? "" : new Date(Date.now() - Number(period) * 864e5).toLocaleDateString("en-CA");
  const rows = trainings.filter(t => t.trained_on >= since);
  const device = rows.filter(t => t.record_type === "设备训练"), other = rows.filter(t => t.record_type !== "设备训练");
  const col = (title: string, Icon: React.ElementType, list: Rec[], isDevice: boolean, empty: string) => <section className="overflow-hidden rounded-2xl border bg-card">
    <div className="flex items-center justify-between bg-primary/5 px-4 py-2"><p className="flex items-center gap-2 text-lg font-bold"><Icon className="h-6 w-6 text-primary" />{title}（{list.length}）</p><Ring value={completionRate(list, isDevice)} label={isDevice ? "平均完成率" : "完成率"} /></div>
    <div className="px-4">{list.length ? list.map(r => <Row key={r.id} r={r} device={isDevice} />) : <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>}</div>
  </section>;
  return <Card className="rounded-2xl border-0 p-5 shadow-soft">
    <div className="mb-4 flex items-center justify-between border-b pb-3">
      <p className="flex items-center gap-2 text-xl font-bold"><Dumbbell className="h-6 w-6 text-primary" />训练记录（{rows.length}）</p>
      <div className="flex items-center gap-2">
        <select aria-label="时间范围" value={period} onChange={e => setPeriod(e.target.value)} className="h-10 rounded-lg border bg-card px-3 text-sm">{PERIODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        {onAdd && <Button className="h-10" onClick={onAdd}><Plus className="mr-1 h-4 w-4" />添加训练记录</Button>}
      </div>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      {col("设备训练记录", Monitor, device, true, "暂无认知训练设备同步的记录")}
      {col("非设备干预记录", PersonStanding, other, false, "暂无非设备干预记录")}
    </div>
  </Card>;
}
