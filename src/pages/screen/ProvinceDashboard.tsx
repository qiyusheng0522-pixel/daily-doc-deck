import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ArrowLeftRight, Building2, CalendarDays, CalendarCheck, ChevronRight, ClipboardCheck, Dumbbell, Layers, MapPin, Search, Users, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { JS_CITIES, JS_VIEWBOX } from "@/data/jiangsuMap";
import { C, Legend, Panel, axis, tip } from "./screenKit";
import { formatValue, METRICS, metricFor, PROVINCE_ALERTS, REGION_DATA, regionalValue, RISKS, serviceTrend, type Region } from "./provinceData";

type Drill = { key: string; region?: string; period?: string; risk?: string; alert?: number };
const ICONS = [Building2, Users, ClipboardCheck, Users, Dumbbell, ArrowLeftRight, ClipboardCheck, Users, CalendarCheck, Building2];
const TOPICS: Record<string, string> = { "站点建设": "stations", "筛查评估": "screening", "干预训练": "intervention", "随访管理": "followup", "双向转诊": "referral", "智能体应用": "tasks", "效果评估": "completion" };
function HoverData({ children, title, text }: { children: ReactNode; title: string; text: string }) {
  return <Tooltip><TooltipTrigger asChild>{children}</TooltipTrigger><TooltipContent className="max-w-[280px] border-scr-cyan/60 bg-scr-panel text-scr-text"><div className="font-bold text-scr-cyan">{title}</div><div className="mt-1 whitespace-normal text-xs leading-relaxed">{text}</div></TooltipContent></Tooltip>;
}
function Trend({ region, population = false, onDrill }: { region?: Region; population?: boolean; onDrill: (d: Drill) => void }) {
  const data = serviceTrend(region);
  return <div className="flex h-full min-h-0 flex-col">
    <Legend items={[{ k: population ? "服务人群" : "筛查人数", c: C.cyan }, { k: population ? "实际筛查" : "干预人数", c: C.green }]} />
    <div className="min-h-0 flex-1"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 12, right: 12, left: -18, bottom: 0 }} onClick={s => { if (s?.activeLabel) onDrill({ key: population ? "elders" : "screening", region: region?.name, period: String(s.activeLabel) }); }}>
      <defs><linearGradient id={`provinceTrend-${region?.name ?? "all"}-${population}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.cyan} stopOpacity={.45} /><stop offset="100%" stopColor={C.cyan} stopOpacity={.05} /></linearGradient><linearGradient id={`g2-${region?.name ?? "all"}-${population}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity={.55} /><stop offset="100%" stopColor={C.green} stopOpacity={.08} /></linearGradient><filter id="lineGlow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <CartesianGrid stroke={C.grid} vertical={false} /><XAxis dataKey="month" {...axis} tickFormatter={v => String(v).slice(5) + "月"} minTickGap={8} /><YAxis {...axis} domain={[(min: number) => +(min * 0.85).toFixed(1), (max: number) => +(max * 1.06).toFixed(1)]} /><ChartTooltip {...tip} formatter={(v: number, name: string) => [`${v}万人`, name]} />
      <Area type="natural" isAnimationActive={false} name={population ? "服务人群" : "筛查人数"} dataKey={population ? "elders" : "screening"} stroke={C.cyan} fill={`url(#provinceTrend-${region?.name ?? "all"}-${population})`} strokeWidth={4} filter="url(#lineGlow)" dot={{ r: 5, fill: "hsl(0 0% 100%)", stroke: C.cyan, strokeWidth: 3 }} activeDot={{ r: 7, fill: "hsl(0 0% 100%)", stroke: C.cyan, strokeWidth: 3 }} />
      <Area type="natural" isAnimationActive={false} name={population ? "实际筛查" : "干预人数"} dataKey={population ? "screening" : "intervention"} stroke={C.green} fill={`url(#g2-${region?.name ?? "all"}-${population})`} strokeWidth={4} filter="url(#lineGlow)" dot={{ r: 5, fill: "hsl(0 0% 100%)", stroke: C.green, strokeWidth: 3 }} activeDot={{ r: 7, fill: "hsl(0 0% 100%)", stroke: C.green, strokeWidth: 3 }} />
    </AreaChart></ResponsiveContainer></div>
  </div>;
}
function Risk({ region, onDrill }: { region?: Region; onDrill: (d: Drill) => void }) {
  const total = region?.elders ?? 27.6;
  const data = RISKS.map(r => ({ ...r, value: +(total * r.pct / 100).toFixed(2) }));
  return <div className="flex h-full min-h-[145px] items-center gap-1">
    <div className="relative h-[145px] w-[42%] shrink-0"><ResponsiveContainer><PieChart><Pie isAnimationActive={false} data={data} dataKey="value" innerRadius="64%" outerRadius="92%" stroke="none" startAngle={90} endAngle={-270}>{data.map(r => <Cell key={r.name} fill={r.color} className="cursor-pointer" onClick={() => onDrill({ key: "risk", region: region?.name, risk: r.name })} />)}</Pie><ChartTooltip {...tip} formatter={(v: number) => [`${v}万人`, "人数"]} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><b className="text-lg">{total}万</b><span className="text-[11px] text-scr-dim">服务人群</span></div></div>
    <div className="min-w-0 flex-1 space-y-1">{data.map(r => <HoverData key={r.name} title={`${r.name} · ${r.value}万人`} text={`占服务人群 ${r.pct}%；统计范围：${region ? region.name + "市" : "江苏省"}。`}><Button variant="screen" className="h-7 w-full justify-start gap-1 border-transparent px-1 text-[11px]" onClick={() => onDrill({ key: "risk", region: region?.name, risk: r.name })}><span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: r.color }} /><span>{r.name}</span><span className="ml-auto tabular-nums">{r.pct}%（{r.value}万）</span></Button></HoverData>)}</div>
  </div>;
}
const FLOW = [
  { key: "screening", label: "筛查评估", icon: Search, bar: 25.5, display: "25.5", unit: "万人", text: "年度已完成 AD-8 认知初筛的老年人数；点击可按设区市查看明细。" },
  { key: "risk", label: "风险分层", icon: Layers, bar: 27.6, display: "27.6", unit: "万人", text: "服务人群风险分层；风险分布明细可按设区市查看。" },
  { key: "intervention", label: "分类干预", icon: Dumbbell, bar: 4.74, display: "4.74", unit: "万人", text: "年度接受认知训练与分级干预的老年人数。" },
  { key: "followup", label: "随访管理", icon: Users, bar: 6.3, display: "6.3", unit: "万人", text: "年度纳入持续随访服务的人数。" },
  { key: "referral", label: "双向转诊", icon: ArrowLeftRight, bar: 0.4317, display: "4,317", unit: "人", text: "年度登记的上转与下转服务人数。" },
];
function Flow({ onDrill }: { onDrill: (d: Drill) => void }) {
  const max = Math.max(...FLOW.map(f => f.bar));
  return <div className="flex h-full flex-col justify-center gap-1 px-1">
    {FLOW.map(f => {
      const width = Math.max(12, Math.sqrt(f.bar / max) * 100);
      return <HoverData key={f.key} title={`${f.label} · ${f.display}${f.unit}`} text={f.text}>
        <Button variant="screen" className="h-[44px] w-full justify-start gap-3 rounded-lg border-transparent bg-transparent px-2 hover:bg-scr-line/25" onClick={() => onDrill({ key: f.key })}>
          <span className="province-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-scr-cyan/70"><f.icon className="!h-5 !w-5 text-scr-cyan" /></span>
          <span className="min-w-0 flex-1">
            <span className="mb-1 block text-[11px] leading-none text-scr-dim">{f.label}</span>
            <span className="block h-3.5 overflow-hidden rounded-full bg-scr-line/25 shadow-[inset_0_1px_4px_hsl(var(--scr-bg)/0.9)]">
              <span className="block h-full rounded-full" style={{ width: `${width}%`, background: "linear-gradient(90deg, hsl(var(--scr-cyan)), hsl(var(--scr-blue)))", boxShadow: "0 0 10px hsl(var(--scr-cyan) / 0.55)" }} />
            </span>
          </span>
          <span className="w-[86px] shrink-0 text-right"><b className="text-lg font-black tabular-nums text-scr-text">{f.display}</b><span className="ml-1 text-xs text-scr-dim">{f.unit}</span></span>
        </Button>
      </HoverData>;
    })}
  </div>;
}
function MetricButton({ index, region, compact = false, onDrill }: { index: number; region?: Region; compact?: boolean; onDrill: (d: Drill) => void }) {
  const m = METRICS[index]; const Icon = ICONS[index]; const v = region ? regionalValue(region, m.key) : m.total;
  return <HoverData title={`${region ? region.name + "市" : "全省"} · ${m.label}`} text={`${formatValue(v, m.key)}；${m.definition}。${m.note}。统计期：2026年1—10月；演示数据。`}><Button variant="screen" className={`h-full min-h-[86px] w-full justify-start whitespace-normal rounded-lg px-2 py-2 ${compact ? "border-transparent" : "scr-panel"}`} onClick={() => onDrill({ key: m.key, region: region?.name })}>
    <span className={`province-icon flex shrink-0 items-center justify-center rounded-full border border-scr-cyan/70 ${compact ? "h-12 w-12 shadow-[0_0_14px_hsl(var(--scr-cyan)/0.45)]" : "h-12 w-12"}`}><Icon className={`${compact ? "!h-6 !w-6" : "!h-6 !w-6"} text-scr-cyan`} /></span>
    <div className="min-w-0 text-left"><div className="text-xs font-semibold text-scr-dim">{m.label}</div><div className={`whitespace-nowrap font-black leading-tight text-scr-cyan ${compact ? "text-[24px]" : "text-[26px]"}`}>{v.toLocaleString("zh-CN")}<span className="ml-1 text-xs font-normal text-scr-text">{m.unit}</span></div>{index === 0 && !region && <div className="text-[11px] text-scr-dim">目标 200 个 · 78%</div>}</div>
  </Button></HoverData>;
}

const SHIFT: Record<string, number> = { 南京: 0.8, 苏州: 1.2, 无锡: 0.6, 宿迁: -2.1, 连云港: -1.4 };
function Gauges({ onDrill }: { onDrill: (d: Drill) => void }) {
  const items = [{ label: "干预指导率", v: 91.1, c: C.cyan, key: "intervention" }, { label: "训练任务完成率", v: 88.7, c: C.green, key: "tasks" }];
  return <div className="grid h-full grid-cols-2 divide-x divide-scr-line/40">{items.map(g => <HoverData key={g.label} title={`${g.label} · ${g.v}%`} text="全省年度统计，点击查看各设区市明细。"><button type="button" className="flex h-full flex-col items-center justify-center gap-1" onClick={() => onDrill({ key: g.key })}>
    <div className="relative aspect-square h-[70%] max-h-[130px] min-h-[90px]"><ResponsiveContainer><PieChart><Pie isAnimationActive={false} data={[{ v: g.v }, { v: 100 - g.v }]} dataKey="v" innerRadius="74%" outerRadius="96%" startAngle={90} endAngle={-270} stroke="none"><Cell fill={g.c} /><Cell fill="hsl(var(--scr-line) / 0.35)" /></Pie></PieChart></ResponsiveContainer><b className="absolute inset-0 flex items-center justify-center text-xl font-black text-scr-text">{g.v}%</b></div>
    <span className="text-sm text-scr-text">{g.label}</span></button></HoverData>)}</div>;
}
function CityBars({ city, onPick }: { city: string; onPick: (n: string) => void }) {
  const rows = [...REGION_DATA].sort((a, b) => b.elders - a.elders); const max = rows[0].elders;
  return <div className="flex min-h-0 flex-col rounded-md border border-scr-line/50 bg-scr-panel/60 p-2"><h4 className="mb-1 text-sm font-bold">设区市服务量</h4><div className="flex min-h-0 flex-1 flex-col justify-between">{rows.map(r => <button key={r.name} type="button" onClick={() => onPick(r.name)} className={`flex items-center gap-2 rounded px-1 py-0.5 text-[12px] hover:bg-scr-line/30 ${city === r.name ? "text-scr-gold" : "text-scr-text"}`}><span className="w-10 shrink-0 text-left">{r.name}</span><span className="h-2 flex-1 overflow-hidden rounded-full bg-scr-line/25"><span className="block h-full rounded-full" style={{ width: `${r.elders / max * 100}%`, background: city === r.name ? "hsl(var(--scr-gold))" : "linear-gradient(90deg, hsl(var(--scr-blue)), hsl(var(--scr-cyan)))" }} /></span><span className="w-12 shrink-0 text-right tabular-nums">{r.elders}万</span></button>)}</div></div>;
}
function Focus({ onDrill }: { onDrill: (d: Drill) => void }) {
  const items = [{ label: "高风险人群", v: "2.93", u: "万人", icon: Users, key: "risk", gold: true }, { label: "干预指导率", v: "91.1", u: "%", icon: Dumbbell, key: "intervention" }, { label: "转诊完成率", v: "88.7", u: "%", icon: ArrowLeftRight, key: "acceptance" }];
  return <div className="flex h-full flex-col justify-between gap-2">{items.map((f, k) => <Button key={f.label} variant="screen" className="h-auto min-h-[56px] flex-1 justify-start gap-3 rounded-lg px-3" onClick={() => onDrill({ key: f.key })}><span className="province-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-scr-cyan/70"><f.icon className="!h-5 !w-5 text-scr-cyan" /></span><span className="text-left"><span className="block text-xs text-scr-dim">{f.label}</span><b className={`text-[22px] font-black ${f.gold ? "text-scr-gold" : "text-scr-cyan"}`}>{f.v}</b><span className="ml-1 text-xs">{f.u}</span></span><span className="ml-auto flex h-8 items-end gap-[3px]">{[3,4,4,5,6,6,7,8].map((h, i) => <span key={i} className="w-[6px] rounded-sm" style={{ height: `${(h + k) * 9}%`, background: f.gold ? "hsl(var(--scr-gold))" : "hsl(var(--scr-cyan))" }} />)}</span></Button>)}</div>;
}
function RiskCompare({ region, onDrill }: { region: Region; onDrill: (d: Drill) => void }) {
  const d = SHIFT[region.name] ?? 0.3; const base = RISKS.map(r => r.pct);
  const city = base.map((p, i) => i === 0 ? +(p + d).toFixed(1) : i === base.length - 1 ? +(p - d).toFixed(1) : p);
  const rows = [{ n: `${region.name}市`, v: city, r: region.name }, { n: "江苏省", v: base, r: undefined }];
  return <div className="flex h-full flex-col justify-center gap-3"><div className="flex flex-wrap justify-center gap-3 text-[11px]">{RISKS.map(r => <span key={r.name} className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: r.color }} />{r.name}</span>)}</div>{rows.map(row => <div key={row.n} className="flex items-center gap-2"><span className="w-12 shrink-0 text-xs">{row.n}</span><div className="flex h-7 flex-1 overflow-hidden rounded">{row.v.map((p, i) => <HoverData key={i} title={`${row.n} · ${RISKS[i].name}`} text={`占服务人群 ${p}%`}><button type="button" onClick={() => onDrill({ key: "risk", region: row.r, risk: RISKS[i].name })} className="flex items-center justify-center text-[11px] font-bold text-scr-bg" style={{ width: `${p}%`, background: RISKS[i].color }}>{p >= 6 ? `${p}%` : ""}</button></HoverData>)}</div></div>)}</div>;
}

export default function ProvinceDashboard({ nav, onOverview }: { nav: string; onOverview: () => void }) {
  const [city, setCity] = useState("南京");
  const [hovered, setHovered] = useState<string>();
  const [drill, setDrill] = useState<Drill>();
  const [history, setHistory] = useState<Drill[]>([]);
  const [search, setSearch] = useState("");
  const [mapMode, setMapMode] = useState("江苏省");
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const region = REGION_DATA.find(r => r.name === city) ?? REGION_DATA[0];
  const hoverRegion = REGION_DATA.find(r => r.name === hovered);
  const open = (d: Drill) => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setHistory([]); setSearch(""); setDrill(d); };
  const close = () => { setDrill(undefined); setHistory([]); onOverview(); returnFocus.current?.focus(); };
  useEffect(() => { if (TOPICS[nav]) { setDrill({ key: TOPICS[nav] }); setHistory([]); setSearch(""); } else setDrill(undefined); }, [nav]);
  useEffect(() => { if (drill) closeRef.current?.focus(); }, [Boolean(drill)]);
  const select = (name: string) => { setCity(name); setHovered(undefined); };
  const selectedMetric = metricFor(drill?.key ?? "stations");
  const drillRegion = REGION_DATA.find(r => r.name === drill?.region);
  const rows = REGION_DATA.filter(r => (!drillRegion || r.name === drillRegion.name) && r.name.includes(search));
  const title = drill?.alert !== undefined ? "重点预警详情" : drill?.risk ? `${drill.risk}人群详情` : `${selectedMetric.label}详情`;
  const next = (d: Drill) => { if (drill) setHistory(h => [...h, drill]); setSearch(""); setDrill(d); };
  return <TooltipProvider delayDuration={120}><div className="province-screen space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-scr-dim"><span>年度统计 · 2026年1—10月</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-scr-gold" />演示数据 · 非实时监管数据</span></div>
    <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{METRICS.slice(0, 6).map((m, i) => <MetricButton key={m.key} index={i} onDrill={open} />)}</section>
    <div className="province-grid xl:h-[calc(100vh-215px)] xl:min-h-[700px]">
      <div className="flex min-h-0 min-w-0 flex-col gap-3">
        <Panel title="人群风险分布" sub="N=27.6万" className="min-h-[190px] flex-[1.05]"><Risk onDrill={open} /></Panel>
        <Panel title="服务人群趋势" sub="人数 / 万人" extra={<Button variant="screen" size="icon" className="h-6 w-6" aria-label="查看服务人群趋势详情" onClick={() => open({ key: "elders" })}><ChevronRight /></Button>} className="min-h-[200px] flex-[1.25]"><Trend population onDrill={open} /></Panel>
        <Panel title="干预服务情况" className="min-h-[190px] flex-1"><Gauges onDrill={open} /></Panel>
      </div>
      <div className="province-center flex min-h-0 min-w-0 flex-col gap-3">
        <Panel title="全省服务态势与区域分析" className="min-h-[420px] flex-[2.1]" extra={<div className="flex gap-1">{["江苏省", "设区市"].map(m => <Button key={m} variant="screen" size="sm" className={`h-7 rounded-full px-3 text-xs ${mapMode === m ? "border-scr-cyan bg-scr-line/50 text-scr-cyan" : ""}`} onClick={() => setMapMode(m)}>{m}</Button>)}</div>}>
          <div className="province-map relative grid h-full min-h-[380px] grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(170px,30%)]">
            <div className="relative min-h-[360px] min-w-0"><div className="province-orbit absolute inset-x-[6%] bottom-4 h-12 rounded-[50%]" />
              {mapMode === "江苏省" ? <svg role="group" aria-label="江苏省设区市地图" viewBox={JS_VIEWBOX} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
                <defs><linearGradient id="provinceMapFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--scr-map-top))" /><stop offset="100%" stopColor="hsl(var(--scr-map-bottom))" /></linearGradient><linearGradient id="provinceMapSelected" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--scr-map-gold))" /><stop offset="100%" stopColor="hsl(var(--scr-map-gold-bottom))" /></linearGradient></defs>
                <g transform="translate(0 9)" aria-hidden="true">{JS_CITIES.map(c => <path key={c.name} d={c.d} fill="hsl(var(--scr-map-bottom))" stroke="hsl(var(--scr-line))" strokeWidth={2} />)}</g>
                {JS_CITIES.map(c => <path key={c.name} role="button" tabIndex={0} aria-label={`选择${c.name}市`} aria-pressed={city === c.name} d={c.d} fill={city === c.name ? "url(#provinceMapSelected)" : "url(#provinceMapFill)"} stroke={hovered === c.name ? "hsl(var(--scr-gold))" : "hsl(var(--scr-map-edge))"} strokeWidth={city === c.name || hovered === c.name ? 2.5 : 1} className="cursor-pointer" onClick={() => select(c.name)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(c.name); } }} onMouseEnter={() => setHovered(c.name)} onMouseLeave={() => setHovered(undefined)} onFocus={() => setHovered(c.name)} onBlur={() => setHovered(undefined)} />)}
                {JS_CITIES.map(c => <g key={c.name + "label"} className="pointer-events-none" textAnchor="middle"><rect x={c.cx - 38} y={c.cy - 26} width={76} height={50} rx={6} fill="hsl(var(--scr-panel) / 0.75)" stroke={city === c.name ? "hsl(var(--scr-gold))" : "hsl(var(--scr-cyan) / 0.7)"} /><text x={c.cx} y={c.cy - 5} fill="hsl(var(--scr-text))" fontSize={16} fontWeight={700}>{c.name}</text><text x={c.cx} y={c.cy + 16} fill="hsl(var(--scr-gold))" fontSize={18} fontWeight={800}>{REGION_DATA.find(r => r.name === c.name)?.elders}万</text></g>)}
              </svg> : <div className="absolute inset-0 grid grid-cols-2 content-start gap-2 overflow-y-auto p-2">{REGION_DATA.map(r => <HoverData key={r.name} title={`${r.name}市`} text={`训练站 ${r.stations} 个；服务老年人 ${r.elders} 万人；随访完成率 ${r.completion}%。`}><Button variant="screen" className={`h-12 justify-between ${city === r.name ? "border-scr-gold text-scr-gold" : ""}`} onClick={() => select(r.name)}><span>{r.name}</span><b>{r.stations}个</b></Button></HoverData>)}</div>}
              {hoverRegion && <div role="tooltip" className="pointer-events-none absolute left-3 top-2 z-10 rounded border border-scr-cyan bg-scr-panel/95 p-3 text-xs"><b className="text-sm text-scr-cyan">{hoverRegion.name}市</b><div className="mt-1">训练站点：{hoverRegion.stations} 个</div><div>服务老年人：{hoverRegion.elders} 万人</div><div>随访完成率：{hoverRegion.completion}%</div></div>}
            </div>
            <CityBars city={city} onPick={select} />
          </div>
        </Panel>
        <Panel title={`${city}市服务趋势`} sub="人数 / 万人" className="min-h-[200px] flex-1" extra={<Button variant="screen" size="icon" className="h-6 w-6" aria-label={`查看${city}市服务趋势详情`} onClick={() => open({key:"screening",region:city})}><ChevronRight /></Button>}><Trend region={region} onDrill={open} /></Panel>
      </div>
      <div className="province-right flex min-h-0 min-w-0 flex-col gap-3">
        <Panel title="重点关注" className="min-h-[230px] flex-[1.3]"><Focus onDrill={open} /></Panel>
        <Panel title="预警" className="min-h-[170px] flex-1" extra={<Button variant="screen" size="sm" className="h-6 px-1 text-xs" onClick={() => open({ key: "completion", alert: -1 })}>更多<ChevronRight /></Button>}><ul className="flex h-full flex-col justify-around gap-1">{PROVINCE_ALERTS.map((a, i) => <li key={a.city}><HoverData title={`${a.city}市 · ${a.severity}`} text={`${a.text}（${a.value}）。${a.action}`}><Button variant="screen" className="h-auto min-h-[38px] w-full justify-start gap-2 whitespace-normal rounded-md border-scr-red/40 bg-scr-red/10 px-2 py-1.5 text-left" onClick={() => { select(a.city); open({ key: a.metric, region: a.city, alert: i }); }}><AlertTriangle className={`!h-5 !w-5 shrink-0 ${i === 0 ? "text-scr-red" : "text-scr-gold"}`} /><span className="min-w-0 flex-1 text-[12px] leading-5">{a.city}市{a.text} <b className="text-scr-text">{a.value}</b></span><ChevronRight className="text-scr-dim" /></Button></HoverData></li>)}</ul></Panel>
        <Panel title="区域风险分布对比" sub="占服务人群比例" className="min-h-[170px] flex-1"><RiskCompare region={region} onDrill={open} /></Panel>
      </div>
    </div>
    {drill && <aside role="dialog" aria-modal="false" aria-label={title} onKeyDown={e => { if (e.key === "Escape") close(); }} className="province-detail fixed bottom-0 right-0 top-0 z-40 flex w-full max-w-[480px] flex-col border-l border-scr-cyan/60 bg-scr-bg text-scr-text">
      <header className="flex items-center gap-2 border-b border-scr-line/40 p-4">{history.length > 0 && <Button variant="screen" size="icon" aria-label="返回上一级" onClick={() => { const previous = history[history.length-1]; setDrill(previous); setHistory(h=>h.slice(0,-1)); setSearch(""); }}><ArrowLeft /></Button>}<div className="min-w-0 flex-1"><h2 className="text-lg font-bold">{title}</h2><p className="text-xs text-scr-dim">{drill.region ? `${drill.region}市` : "江苏省"} · {drill.period ?? "2026年1—10月"} · 演示数据</p></div><Button ref={closeRef} variant="screen" size="icon" aria-label="关闭详情" onClick={close}><X /></Button></header>
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {drill.alert !== undefined ? <div className="space-y-3">{PROVINCE_ALERTS.filter((_,i)=>drill.alert === -1 || drill.alert === i).map((a,i)=><div key={a.city} className="border-b border-scr-line/40 pb-4"><div className="flex items-center justify-between"><b className="text-scr-gold">{a.city}市 · {a.severity}关注</b><span className="text-xs text-scr-dim">{a.time}</span></div><p className="my-2">{a.text}（{a.value}）</p><p className="text-sm leading-6 text-scr-dim">建议跟进：{a.action}</p><Button variant="screen" className="mt-3" onClick={()=> {select(a.city);next({key:a.metric,region:a.city});}}>查看区域指标<ChevronRight /></Button></div>)}</div> : <>
          <div><div className="text-sm text-scr-dim">{drill.risk ?? selectedMetric.label}</div><div className="mt-1 text-3xl font-black text-scr-cyan">{drill.risk ? `${((drillRegion?.elders ?? 27.6) * (RISKS.find(r=>r.name===drill.risk)?.pct ?? 0)/100).toFixed(2)}万人` : drill.period && ["elders","screening","intervention"].includes(drill.key) ? `${serviceTrend(drillRegion).find(r=>r.month===drill.period)?.[drill.key === "elders" ? "elders" : drill.key === "intervention" ? "intervention" : "screening"] ?? 0}万人` : formatValue(drillRegion ? regionalValue(drillRegion,drill.key) : selectedMetric.total,drill.key)}</div><p className="mt-2 text-sm leading-6 text-scr-dim">{drill.risk ? `所选服务人群中${drill.risk}的人数与占比。` : selectedMetric.definition}</p></div>
          {drillRegion && <div className="flex flex-wrap gap-1">{METRICS.slice(0,6).map(m=><Button key={m.key} variant="screen" size="sm" className={`h-7 text-xs ${drill.key===m.key ? "border-scr-cyan text-scr-cyan" : ""}`} onClick={()=>next({...drill,key:m.key,risk:undefined,period:undefined})}>{m.label}</Button>)}</div>}
          {drill.key === "risk" ? <div className="h-[185px]"><Risk region={drillRegion} onDrill={next} /></div> : drill.key !== "stations" && !["completion","acceptance"].includes(drill.key) ? <div className="h-[200px]"><h3 className="mb-2 text-sm font-bold">服务人数趋势（万人）</h3><div className="h-[170px]"><Trend region={drillRegion} population={drill.key === "elders"} onDrill={next} /></div></div> : null}
          {drillRegion ? <div className="space-y-2"><h3 className="font-bold">{drillRegion.name}市服务指标</h3>{METRICS.map(m=><HoverData key={m.key} title={m.label} text={m.definition}><Button variant="screen" className="h-10 w-full justify-between rounded-none border-x-0 border-t-0" onClick={()=>next({key:m.key,region:drillRegion.name})}><span>{m.label}</span><b className="ml-auto text-scr-cyan">{formatValue(regionalValue(drillRegion,m.key),m.key)}</b><ChevronRight /></Button></HoverData>)}</div> : <div><div className="mb-3 flex items-center justify-between gap-2"><h3 className="font-bold">设区市明细</h3><input aria-label="搜索设区市" value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索城市" className="w-32 rounded border border-scr-line bg-scr-panel px-2 py-1 text-sm outline-none focus:border-scr-cyan" /></div><div className="mb-1 flex justify-between px-3 text-xs text-scr-dim"><span>设区市</span><span>{drill.risk ?? selectedMetric.label}</span></div>{rows.length===0 && <p className="py-6 text-center text-sm text-scr-dim">未找到匹配的城市</p>}{rows.map(r=><HoverData key={r.name} title={`${r.name}市`} text={`训练站 ${r.stations} 个；服务老年人 ${r.elders} 万人。`}><Button variant="screen" className="h-11 w-full justify-between rounded-none border-x-0 border-t-0" onClick={()=>{select(r.name);next({...drill,region:r.name});}}><span>{r.name}市</span><b className="ml-auto text-scr-cyan">{drill.risk ? `${(r.elders * (RISKS.find(a=>a.name===drill.risk)?.pct ?? 0)/100).toFixed(2)}万人` : formatValue(regionalValue(r,drill.key),drill.key)}</b><ChevronRight /></Button></HoverData>)}</div>}
          {drillRegion?.name === "南京" && <Button variant="screen" asChild className="w-full"><Link to="/screen?level=city">进入南京市指导中心视角<ChevronRight /></Link></Button>}
        </>}
      </div><footer className="border-t border-scr-line/40 p-3 text-[11px] leading-5 text-scr-dim">统计范围：{drill.region ? `${drill.region}市` : "全省13个设区市"}。演示汇总数据，不含个人健康档案；城市分项为演示分配值。</footer>
    </aside>}
  </div></TooltipProvider>;
}
