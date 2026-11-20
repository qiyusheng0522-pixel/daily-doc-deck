import { Activity, Brain, Building2, ClipboardCheck, Clock3, HeartPulse, MapPin, ShieldCheck, ShieldAlert, TriangleAlert, Users, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function metricIcon(label: string): LucideIcon {
  if (/站/.test(label)) return Building2;
  if (/区域|城市|覆盖/.test(label)) return MapPin;
  if (/待|时间/.test(label)) return Clock3;
  if (/高风险|阳性/.test(label)) return TriangleAlert;
  if (/中风险/.test(label)) return ShieldAlert;
  if (/低风险|阴性/.test(label)) return ShieldCheck;
  if (/指导|分级|完成/.test(label)) return ClipboardCheck;
  if (/就诊/.test(label)) return HeartPulse;
  if (/认知|记忆|注意|语言|计算|定向/.test(label)) return Brain;
  if (/人|服务/.test(label)) return Users;
  return Activity;
}

export function MetricLabel({ label }: { label: string }) {
  const Icon = metricIcon(label);
  return <span className="inline-flex min-w-0 items-center gap-1.5"><Icon aria-hidden="true" className="!h-4 !w-4 shrink-0 text-scr-cyan" /><span>{label}</span></span>;
}

export default function ScreenMetric({ label, value, unit = "人", compact = false }: { label: string; value: ReactNode; unit?: string; compact?: boolean }) {
  const Icon = metricIcon(label);
  if (compact) return <span className="inline-flex flex-wrap items-center gap-1.5"><MetricLabel label={label} /><b className="tabular-nums text-scr-text">{value}</b><span className="text-scr-dim">{unit}</span></span>;
  return <div className="screen-metric flex min-w-0 items-center gap-2.5"><span className="screen-metric-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-scr-line/40 bg-scr-line/10"><Icon aria-hidden="true" className="!h-5 !w-5 text-scr-cyan" /></span><div className="min-w-0"><span className="block text-[16.8px] text-scr-dim">{label}</span><span className="flex items-baseline gap-1 whitespace-nowrap"><b className="text-[30px] font-bold tabular-nums text-scr-text">{value}</b><span className="text-[16.8px] text-scr-dim">{unit}</span></span></div></div>;
}