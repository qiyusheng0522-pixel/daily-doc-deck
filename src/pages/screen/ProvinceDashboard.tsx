import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ProvinceEChartMap from "./ProvinceEChartMap";
import { C, Legend, Panel, axis, tip } from "./screenKit";
import { formatValue, METRICS, metricFor, PROVINCE_ALERTS, REGION_DATA, regionalValue, RISKS, serviceTrend, type Region } from "./provinceData";
import { demoRegulatoryCounts, INDICATORS, indicatorResult } from "./regulatoryMetrics";
import { ProvinceSummary, ProvinceRecent, ScreeningFeed } from "./ProvinceActivityPanels";
import { activityDays, type Period } from "./provinceActivityData";

type Drill = { key: string; region?: string; period?: string; risk?: string; alert?: number };
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
    <div className="relative h-[145px] w-[42%] shrink-0"><ResponsiveContainer><PieChart><Pie isAnimationActive={false} data={data} dataKey="value" innerRadius="64%" outerRadius="92%" stroke="none" startAngle={90} endAngle={-270}>{data.map(r => <Cell key={r.name} fill={r.color} className="cursor-pointer" onClick={() => onDrill({ key: "risk", region: region?.name, risk: r.name })} />)}</Pie><ChartTooltip {...tip} formatter={(v: number) => [`${v}万人`, "人数"]} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><b className="text-lg">{total}万</b><span className="text-[18.48px] text-scr-dim">服务人群</span></div></div>
    <div className="min-w-0 flex-1 space-y-0.5">{data.map(r => <HoverData key={r.name} title={`${r.name} · ${r.value}万人`} text={`占服务人群 ${r.pct}%；统计范围：${region ? region.name + "市" : "江苏省"}。`}><Button variant="screen" className="h-auto w-full flex-col items-stretch gap-0 border-transparent px-1 py-0.5 text-[18.48px]" onClick={() => onDrill({ key: "risk", region: region?.name, risk: r.name })}><span className="flex w-full items-center gap-1"><span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: r.color }} /><span>{r.name}</span></span><span className="w-full text-right tabular-nums">{r.pct}%（{r.value}万）</span></Button></HoverData>)}</div>
  </div>;
}
export default function ProvinceDashboard({ nav, onOverview }: { nav: string; onOverview: () => void }) {
  const [city, setCity] = useState("南京");
  const [period, setPeriod] = useState<Period>(14);
  const [updated, setUpdated] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setUpdated(new Date()), 60000); return () => clearInterval(timer); }, []);
  const activities = activityDays(1, updated);
  const periodActivities = activityDays(period, updated).filter(r => r.city === city);
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
  const regulatoryIndicator = INDICATORS.find(i => i.key === drill?.key);
  const drillRegion = REGION_DATA.find(r => r.name === drill?.region);
  const regulatoryResult = regulatoryIndicator ? indicatorResult(demoRegulatoryCounts(drillRegion ? Math.round(drillRegion.elders * 10000) : 276000, drillRegion?.coverage ?? 92.4), regulatoryIndicator.key) : undefined;
  const rows = REGION_DATA.filter(r => (!drillRegion || r.name === drillRegion.name) && r.name.includes(search));
  const title = regulatoryIndicator ? `${regulatoryIndicator.short}详情` : drill?.alert !== undefined ? "重点预警详情" : drill?.risk ? `${drill.risk}人群详情` : `${selectedMetric.label}详情`;
  const next = (d: Drill) => { if (drill) setHistory(h => [...h, drill]); setSearch(""); setDrill(d); };
  return <TooltipProvider delayDuration={120}><div className="province-screen space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2 text-[16.8px] text-scr-dim"><span>江苏省 · 13个设区市 · 156个训练站</span><span>演示汇总与动态 · 未接入实时筛查服务</span></div>
    <div className="province-grid province-activity-grid">
      <ProvinceSummary rows={activities} city={city} onPick={select} />
      <div className="province-center flex min-h-0 min-w-0 flex-col gap-3">
        <Panel title="江苏省筛查地图" className="min-h-[520px] flex-[2]" extra={<div className="screen-segments flex gap-1">{["江苏省", "设区市"].map(m => <Button key={m} variant="screenQuiet" size="sm" aria-pressed={mapMode === m} className="h-7 px-3 text-[16.8px]" onClick={() => setMapMode(m)}>{m === "江苏省" ? "地图" : "区域列表"}</Button>)}</div>}>
          <div className="province-map relative grid h-full min-h-[460px] grid-cols-1 gap-2">
            <div className="relative min-h-[430px] min-w-0">
              {mapMode === "江苏省" ? <ProvinceEChartMap city={city} rows={activities} onPick={select} /> : <div className="absolute inset-0 grid grid-cols-2 content-start gap-2 overflow-y-auto p-2">{REGION_DATA.map(r => <HoverData key={r.name} title={`${r.name}市`} text={`训练站 ${r.stations} 个；服务老年人 ${r.elders} 万人；随访完成率 ${r.completion}%。`}><Button variant="screen" className={`h-12 justify-between ${city === r.name ? "border-scr-gold text-scr-gold" : ""}`} onClick={() => select(r.name)}><span>{r.name}</span><b>{r.stations}个</b></Button></HoverData>)}</div>}
              {hoverRegion && <div role="tooltip" className="pointer-events-none absolute left-3 top-2 z-10 rounded border border-scr-cyan bg-scr-panel/95 p-3 text-xs"><b className="text-sm text-scr-cyan">{hoverRegion.name}市</b><div className="mt-1">训练站点：{hoverRegion.stations} 个</div><div>服务老年人：{hoverRegion.elders} 万人</div><div>随访完成率：{hoverRegion.completion}%</div></div>}
            </div>

          </div>
        </Panel>
        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-scr-line/40 px-3 py-2"><div><b className="text-lg text-scr-gold">{city}市</b><span className="ml-3 text-[16.8px] text-scr-dim">训练站 {region.stations} 个 · 服务 {region.elders} 万人</span></div><Button variant="screenQuiet" size="sm" onClick={() => open({key:"stations",region:city})}>区域详情<ChevronRight className="ml-1 h-4 w-4" /></Button></div>
        <ScreeningFeed rows={activities} city={city} onPick={select} />
      </div>
      <ProvinceRecent rows={periodActivities} recentRows={activities} city={city} period={period} onPeriod={setPeriod} />
    </div>
    {drill && <aside role="dialog" aria-modal="false" aria-label={title} onKeyDown={e => { if (e.key === "Escape") close(); }} className="province-detail fixed bottom-0 right-0 top-0 z-40 flex w-full max-w-[480px] flex-col border-l border-scr-cyan/60 bg-scr-bg text-scr-text">
      <header className="flex items-center gap-2 border-b border-scr-line/40 p-4">{history.length > 0 && <Button variant="screen" size="icon" aria-label="返回上一级" onClick={() => { const previous = history[history.length-1]; setDrill(previous); setHistory(h=>h.slice(0,-1)); setSearch(""); }}><ArrowLeft /></Button>}<div className="min-w-0 flex-1"><h2 className="text-lg font-bold">{title}</h2><p className="text-xs text-scr-dim">{drill.region ? `${drill.region}市` : "江苏省"} · {drill.period ?? "2026年1—10月"} · 演示数据</p></div><Button ref={closeRef} variant="screen" size="icon" aria-label="关闭详情" onClick={close}><X /></Button></header>
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {regulatoryIndicator && regulatoryResult ? <div className="space-y-4"><h3 className="font-bold">{regulatoryIndicator.label}</h3><b className="text-3xl text-scr-cyan">{regulatoryResult.value === null ? "暂无数据" : `${regulatoryResult.value}%`}</b><p>分子：{regulatoryResult.numerator.toLocaleString()} 人<br />{regulatoryIndicator.numeratorRule}</p><p>分母：{regulatoryResult.denominator.toLocaleString()} 人<br />{regulatoryIndicator.denominatorRule}</p><p className="text-sm leading-[2.1rem] text-scr-gold">{regulatoryIndicator.note}</p><h3 className="font-bold">设区市明细 · 分子 / 分母</h3>{REGION_DATA.map(r => { const result = indicatorResult(demoRegulatoryCounts(Math.round(r.elders * 10000), r.coverage), regulatoryIndicator.key); return <Button variant="screen" key={r.name} className="h-auto w-full justify-between whitespace-normal py-2" onClick={() => next({key: regulatoryIndicator.key, region:r.name})}><span>{r.name}市</span><span className="text-right">{result.value}%<span className="block text-xs text-scr-dim">{result.numerator.toLocaleString()} / {result.denominator.toLocaleString()} 人</span></span></Button>; })}</div> : drill.alert !== undefined ? <div className="space-y-3">{PROVINCE_ALERTS.filter((_,i)=>drill.alert === -1 || drill.alert === i).map((a,i)=><div key={a.city} className="border-b border-scr-line/40 pb-4"><div className="flex items-center justify-between"><b className="text-scr-gold">{a.city}市 · {a.severity}关注</b><span className="text-xs text-scr-dim">{a.time}</span></div><p className="my-2">{a.text}（{a.value}）</p><p className="text-sm leading-[2.1rem] text-scr-dim">建议跟进：{a.action}</p><Button variant="screen" className="mt-3" onClick={()=> {select(a.city);next({key:a.metric,region:a.city});}}>查看区域指标<ChevronRight /></Button></div>)}</div> : <>
          <div><div className="text-sm text-scr-dim">{drill.risk ?? selectedMetric.label}</div><div className="mt-1 text-3xl font-black text-scr-cyan">{drill.risk ? `${((drillRegion?.elders ?? 27.6) * (RISKS.find(r=>r.name===drill.risk)?.pct ?? 0)/100).toFixed(2)}万人` : drill.period && ["elders","screening","intervention"].includes(drill.key) ? `${serviceTrend(drillRegion).find(r=>r.month===drill.period)?.[drill.key === "elders" ? "elders" : drill.key === "intervention" ? "intervention" : "screening"] ?? 0}万人` : formatValue(drillRegion ? regionalValue(drillRegion,drill.key) : selectedMetric.total,drill.key)}</div><p className="mt-2 text-sm leading-[2.1rem] text-scr-dim">{drill.risk ? `所选服务人群中${drill.risk}的人数与占比。` : selectedMetric.definition}</p></div>
          {drillRegion && <div className="flex flex-wrap gap-1">{METRICS.slice(0,6).map(m=><Button key={m.key} variant="screen" size="sm" className={`h-7 text-xs ${drill.key===m.key ? "border-scr-cyan text-scr-cyan" : ""}`} onClick={()=>next({...drill,key:m.key,risk:undefined,period:undefined})}>{m.label}</Button>)}</div>}
          {drill.key === "risk" ? <div className="h-[185px]"><Risk region={drillRegion} onDrill={next} /></div> : drill.key !== "stations" && !["completion","acceptance"].includes(drill.key) ? <div className="h-[200px]"><h3 className="mb-2 text-sm font-bold">服务人数趋势（万人）</h3><div className="h-[170px]"><Trend region={drillRegion} population={drill.key === "elders"} onDrill={next} /></div></div> : null}
          {drillRegion ? <div className="space-y-2"><h3 className="font-bold">{drillRegion.name}市服务指标</h3>{METRICS.map(m=><HoverData key={m.key} title={m.label} text={m.definition}><Button variant="screen" className="h-10 w-full justify-between rounded-none border-x-0 border-t-0" onClick={()=>next({key:m.key,region:drillRegion.name})}><span>{m.label}</span><b className="ml-auto text-scr-cyan">{formatValue(regionalValue(drillRegion,m.key),m.key)}</b><ChevronRight /></Button></HoverData>)}</div> : <div><div className="mb-3 flex items-center justify-between gap-2"><h3 className="font-bold">设区市明细</h3><input aria-label="搜索设区市" value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索城市" className="w-32 rounded border border-scr-line bg-scr-panel px-2 py-1 text-sm outline-none focus:border-scr-cyan" /></div><div className="mb-1 flex justify-between px-3 text-xs text-scr-dim"><span>设区市</span><span>{drill.risk ?? selectedMetric.label}</span></div>{rows.length===0 && <p className="py-6 text-center text-sm text-scr-dim">未找到匹配的城市</p>}{rows.map(r=><HoverData key={r.name} title={`${r.name}市`} text={`训练站 ${r.stations} 个；服务老年人 ${r.elders} 万人。`}><Button variant="screen" className="h-11 w-full justify-between rounded-none border-x-0 border-t-0" onClick={()=>{select(r.name);next({...drill,region:r.name});}}><span>{r.name}市</span><b className="ml-auto text-scr-cyan">{drill.risk ? `${(r.elders * (RISKS.find(a=>a.name===drill.risk)?.pct ?? 0)/100).toFixed(2)}万人` : formatValue(regionalValue(r,drill.key),drill.key)}</b><ChevronRight /></Button></HoverData>)}</div>}
          {drillRegion?.name === "南京" && <Button variant="screen" asChild className="w-full"><Link to="/screen?level=city">进入南京市指导中心视角<ChevronRight /></Link></Button>}
        </>}
      </div><footer className="border-t border-scr-line/40 p-3 text-[18.48px] leading-[1.75rem] text-scr-dim">统计范围：{drill.region ? `${drill.region}市` : "全省13个设区市"}。演示汇总数据，不含个人健康档案；城市分项为演示分配值。</footer>
    </aside>}
  </div></TooltipProvider>;
}
