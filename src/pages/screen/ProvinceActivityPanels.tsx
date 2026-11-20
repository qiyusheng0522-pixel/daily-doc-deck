import { useState } from "react";
import { Activity as ActivityIcon, ChevronRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { C, Panel, axis, tip } from "./screenKit";
import { activityTotals, activityTrend, concernDistribution, PERIODS, type Activity, type Period } from "./provinceActivityData";

const COLORS = [C.cyan, C.green, C.gold, C.red];
const DIMENSIONS = [
  { name: "语言表达", value: 64 }, { name: "物体认知", value: 81 }, { name: "计算能力", value: 89 },
  { name: "时间定向", value: 79 }, { name: "即时记忆", value: 80 }, { name: "延迟记忆", value: 51 }, { name: "注意力", value: 90 },
];

export function ProvinceSummary({ rows, city, onPick }: { rows: Activity[]; city: string; onPick: (city: string) => void }) {
  const totals = activityTotals(rows);
  const ranking = [...new Set(rows.map(r => r.city))].map(name => ({ name, community: rows.find(r => r.city === name)?.community, ...activityTotals(rows.filter(r => r.city === name)) })).sort((a, b) => b.screened - a.screened);
  return <div className="flex min-h-0 min-w-0 flex-col gap-3">
    <Panel title="全省筛查概览" sub="近24小时" className="shrink-0">
      <div className="grid grid-cols-4 gap-1 py-3 text-center">{[{ name: "筛查人数", value: totals.screened, cls: "text-scr-cyan" }, { name: "低风险", value: totals.low, cls: "text-scr-green" }, { name: "中风险", value: totals.medium, cls: "text-scr-gold" }, { name: "高风险", value: totals.high, cls: "text-scr-red" }].map(item => <div key={item.name}><b className={`block text-[28px] font-black tabular-nums ${item.cls}`}>{item.value}</b><span className="mt-1 block text-[14px] text-scr-dim">{item.name}</span></div>)}</div>
      <p className="border-t border-scr-line/30 pt-2 text-[14px] text-scr-dim">分级新增按评估结果统计 · 阳性待评估 {totals.pending} 人</p>
    </Panel>
    <Panel title="认知功能维度分布" sub="正常表现占比" className="min-h-[330px] flex-1">
      <div className="h-full min-h-[285px]"><ResponsiveContainer><RadarChart data={DIMENSIONS} outerRadius="62%" margin={{ top: 24, bottom: 24, left: 28, right: 28 }}><PolarGrid stroke={C.grid} /><PolarAngleAxis dataKey="name" tick={{ fill: C.dim, fontSize: 14 }} /><PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} /><Radar dataKey="value" name="正常表现占比" stroke={C.cyan} fill={C.cyan} fillOpacity={.22} strokeWidth={2} dot={{ r: 4, fill: C.cyan }} isAnimationActive={false} /><Tooltip {...tip} formatter={(v: number) => [`${v}%`, "正常表现占比"]} /></RadarChart></ResponsiveContainer></div>
    </Panel>
    <Panel title="筛查区域排行" sub="近24小时" className="min-h-[310px] flex-1">
      <div className="h-full min-h-0 overflow-auto"><table className="w-full text-[14px]"><thead className="sticky top-0 z-10 bg-scr-panel text-scr-dim"><tr>{["筛查区域", "总数", "低", "中", "高"].map(label => <th key={label} className="px-1 py-2 text-right font-normal first:text-left">{label}</th>)}</tr></thead><tbody>{ranking.map((r, index) => <tr key={r.name} className={`border-t border-scr-line/20 ${city === r.name ? "bg-scr-line/20" : ""}`}><td className="py-1"><Button variant="screen" className={`h-auto w-full justify-start gap-2 border-transparent px-1 py-2 text-[14px] ${city === r.name ? "text-scr-gold" : ""}`} onClick={() => onPick(r.name)}><span className="text-scr-dim">{index + 1}</span>{r.name === "南京" ? "小市社区 · 南京" : `${r.name}市`}</Button></td><td className="px-1 text-right tabular-nums text-scr-cyan">{r.screened}</td><td className="px-1 text-right text-scr-green">{r.low}</td><td className="px-1 text-right text-scr-gold">{r.medium}</td><td className="px-1 text-right text-scr-red">{r.high}</td></tr>)}</tbody></table></div>
    </Panel>
  </div>;
}

export function ScreeningFeed({ rows, city, onPick }: { rows: Activity[]; city: string; onPick: (city: string) => void }) {
  const [selectedOnly, setSelectedOnly] = useState(false);
  const shown = selectedOnly ? rows.filter(r => r.city === city) : rows;
  return <Panel title="筛查动态" sub="演示动态" className="min-h-[280px] flex-1" extra={<Button variant="screen" size="sm" aria-pressed={selectedOnly} className="h-7 px-2 text-[14px]" onClick={() => setSelectedOnly(v => !v)}>{selectedOnly ? `${city}市` : "全省"}</Button>}>
    <div className="h-full overflow-y-auto overscroll-contain">{shown.map((r, index) => <Button key={`${r.city}-${r.time}`} variant="screen" className={`h-auto w-full justify-start gap-3 whitespace-normal rounded-none border-x-0 border-t-0 px-3 py-3 text-left ${r.city === city ? "bg-scr-line/15" : ""}`} onClick={() => onPick(r.city)}>
      <span className="province-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full"><ActivityIcon className="!h-5 !w-5 text-scr-cyan" /></span>
      <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><b className="text-[16.8px] text-scr-text">{r.community}</b><span className="text-[14px] text-scr-dim">{r.time.slice(11)}{index === 0 ? " · 最近更新" : ""}</span></span><span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[14px]"><span className="text-scr-cyan">新增筛查 {r.screened} 人</span><span className="text-scr-green">低风险 +{r.low}</span><span className="text-scr-gold">中风险 +{r.medium}</span><span className="text-scr-red">高风险 +{r.high}</span><span className="text-scr-dim">待进一步评估 {r.pending}</span></span></span><ChevronRight className="!h-4 !w-4 shrink-0 text-scr-dim" />
    </Button>)}</div>
  </Panel>;
}

export function ProvinceRecent({ rows, recentRows, city, period, onPeriod }: { rows: Activity[]; recentRows: Activity[]; city: string; period: Period; onPeriod: (period: Period) => void }) {
  const [distribution, setDistribution] = useState<"risk" | "concern">("risk");
  const totals = activityTotals(rows), recent = activityTotals(recentRows), trend = activityTrend(rows);
  const risks = [{ name: "低风险", value: totals.low }, { name: "中风险", value: totals.medium }, { name: "高风险", value: totals.high }, { name: "待进一步评估", value: totals.pending }];
  const data = distribution === "risk" ? risks : concernDistribution(rows);
  const colors = distribution === "risk" ? [C.green, C.gold, C.red, C.blue] : COLORS;
  const denominator = data.reduce((sum, r) => sum + r.value, 0);
  return <div className="province-right flex min-h-0 min-w-0 flex-col gap-3">
    <Panel title={`${city}市 · 近24小时`} className="shrink-0"><div className="grid grid-cols-2 divide-x divide-scr-line/30 py-3 text-center"><div><b className="block text-[36px] font-black text-scr-cyan">{recent.screened}</b><span className="text-[14px] text-scr-dim">新增筛查人数</span></div><div><b className="block text-[36px] font-black text-scr-red">{recent.positive}</b><span className="text-[14px] text-scr-dim">初筛阳性人数</span></div></div></Panel>
    <Panel title={`${period === 1 ? "今日" : `近${period}日`}筛查趋势`} sub={`${city}市 · 人`} className="min-h-[245px] flex-1">
      <div className="flex flex-wrap gap-1 pb-2" aria-label="趋势统计周期">{PERIODS.map(p => <Button key={p} variant="screen" size="sm" aria-pressed={period === p} className={`h-7 px-2 text-[14px] ${period === p ? "border-scr-cyan bg-scr-line/20 text-scr-cyan" : "text-scr-dim"}`} onClick={() => onPeriod(p)}>{p === 1 ? "24小时" : `${p}日`}</Button>)}</div>
      <div className="h-[calc(100%-38px)] min-h-[170px]"><ResponsiveContainer><BarChart data={trend} margin={{ top: 10, right: 6, left: -24, bottom: 0 }}><CartesianGrid stroke={C.grid} vertical={false} /><XAxis dataKey="date" {...axis} minTickGap={25} /><YAxis {...axis} allowDecimals={false} /><Tooltip {...tip} /><Bar name="筛查人数" dataKey="screened" fill={C.cyan} maxBarSize={18} radius={[3, 3, 0, 0]} isAnimationActive={false} /><Bar name="初筛阳性" dataKey="positive" fill={C.gold} maxBarSize={18} radius={[3, 3, 0, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></div>
    </Panel>
    <Panel title="筛查结果" sub={`近${period === 1 ? "24小时" : `${period}日`}`} className="shrink-0"><div className="grid grid-cols-2 gap-3 px-2 py-2">{[{ name: "初筛阴性", v: totals.negative, cls: "text-scr-green" }, { name: "初筛阳性", v: totals.positive, cls: "text-scr-red" }, { name: "已完成风险分级", v: totals.low + totals.medium + totals.high, cls: "text-scr-cyan" }, { name: "待进一步评估", v: totals.pending, cls: "text-scr-gold" }].map(r => <div key={r.name}><b className={`block text-[25px] font-black ${r.cls}`}>{r.v}<span className="ml-1 text-[14px] font-normal text-scr-dim">人</span></b><span className="text-[14px] text-scr-dim">{r.name}</span></div>)}</div></Panel>
    <Panel title="区域分布" sub={`${city}市`} className="min-h-[315px] flex-[1.2]">
      <div className="flex gap-2" aria-label="分布类别">{[{ key: "risk" as const, name: "认知风险" }, { key: "concern" as const, name: "关注项" }].map(item => <Button key={item.key} variant="screen" size="sm" aria-pressed={distribution === item.key} className={`h-7 px-3 text-[14px] ${distribution === item.key ? "border-scr-cyan text-scr-cyan" : "text-scr-dim"}`} onClick={() => setDistribution(item.key)}>{item.name}</Button>)}</div>
      <div className="relative h-[175px]"><ResponsiveContainer><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="88%" stroke="none" isAnimationActive={false}>{data.map((item, i) => <Cell key={item.name} fill={colors[i]} />)}</Pie><Tooltip {...tip} formatter={(v: number) => [`${v} 人`, "人数"]} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><b className="text-[28px] text-scr-text">{denominator}</b><span className="text-[14px] text-scr-dim">初筛阳性</span></div></div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-[14px]">{data.map((r, i) => <div key={r.name} className="flex flex-wrap items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: colors[i] }} /><span className="text-scr-dim">{r.name}</span><b>{denominator ? Math.round(r.value / denominator * 100) : 0}%</b></div>)}</div>
      <p className="mt-2 text-[14px] text-scr-dim">{distribution === "concern" ? "主要关注项演示分布，不代表临床诊断" : "筛查阳性不等于已确定风险等级"}</p>
    </Panel>
  </div>;
}