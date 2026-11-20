import { useEffect, useRef, useState } from "react";
import { Activity as ActivityIcon, ChevronRight } from "lucide-react";
import ScreenChart, { chartColors } from "./ScreenChart";
import { Button } from "@/components/ui/button";
import ScreenMetric, { MetricLabel } from "./ScreenMetric";
import { C, Panel } from "./screenKit";
import { activityTotals, activityTrend, concernDistribution, PERIODS, type Activity, type Period } from "./provinceActivityData";
import { demoRegulatoryCounts, INDICATORS, indicatorResult, type IndicatorKey } from "./regulatoryMetrics";

const COLORS = [C.cyan, C.blue, "hsl(var(--scr-chart-third))", "hsl(var(--scr-chart-fourth))"];
const DIMENSIONS = [
  { name: "语言表达", value: 64 }, { name: "物体认知", value: 81 }, { name: "计算能力", value: 89 },
  { name: "时间定向", value: 79 }, { name: "即时记忆", value: 80 }, { name: "延迟记忆", value: 51 }, { name: "注意力", value: 90 },
];

export function ProvinceSummary({ rows, city, onPick }: { rows: Activity[]; city: string; onPick: (city: string) => void }) {
  const ranking = [...new Set(rows.map(r => r.city))].map(name => ({ name, community: rows.find(r => r.city === name)?.community, ...activityTotals(rows.filter(r => r.city === name)) })).sort((a, b) => b.screened - a.screened);
  return <div className="flex min-h-0 min-w-0 flex-col gap-3">
    <ProvinceRegulatory />
    <Panel title="认知功能维度分布" sub="正常表现占比" className="min-h-[330px] flex-1">
      <div className="h-full min-h-[285px]"><ScreenChart label="认知功能维度分布" option={{ radar: { indicator: DIMENSIONS.map(d => ({ name: d.name, max: 100 })), radius: "57%", center: ["50%", "51%"], axisName: { color: chartColors().text, fontSize: 17 }, splitLine: { lineStyle: { color: chartColors().line, opacity: .35 } }, splitArea: { show: false } }, series: [{ type: "radar", data: [{ value: DIMENSIONS.map(d => d.value), name: "正常表现占比" }], symbolSize: 6, lineStyle: { color: chartColors().cyan, width: 2 }, itemStyle: { color: chartColors().cyan }, areaStyle: { color: chartColors().cyan, opacity: .15 } }] }} /></div>
    </Panel>
    <Panel title="筛查区域排行" sub="近24小时" className="min-h-[310px] flex-1">
      <div className="h-full min-h-0 overflow-auto"><table className="w-full text-[16.8px]"><thead className="sticky top-0 z-10 bg-scr-panel text-scr-dim"><tr>{["筛查区域", "总数", "低", "中", "高"].map(label => <th key={label} className="px-1 py-2 text-right font-normal first:text-left"><MetricLabel label={label} /></th>)}</tr></thead><tbody>{ranking.map((r, index) => <tr key={r.name} className={`border-t border-scr-line/20 ${city === r.name ? "bg-scr-line/20" : ""}`}><td className="py-1"><Button variant="screenQuiet" className={`h-auto w-full justify-start gap-2 border-transparent px-1 py-2 text-[16.8px] ${city === r.name ? "text-scr-gold" : ""}`} onClick={() => onPick(r.name)}><span className="text-scr-dim">{index + 1}</span>{r.name === "南京" ? "小市社区 · 南京" : `${r.name}市`}</Button></td><td className="px-1 text-right tabular-nums text-scr-cyan">{r.screened}</td><td className="px-1 text-right text-scr-green">{r.low}</td><td className="px-1 text-right text-scr-gold">{r.medium}</td><td className="px-1 text-right text-scr-red">{r.high}</td></tr>)}</tbody></table></div>
    </Panel>
  </div>;
}

export function ScreeningFeed({ rows, city, onPick }: { rows: Activity[]; city: string; onPick: (city: string) => void }) {
  const [selectedOnly, setSelectedOnly] = useState(false);
  const shown = selectedOnly ? rows.filter(r => r.city === city) : rows;
  const scroller = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const signature = shown.map(r => `${r.city}:${r.time}:${r.screened}:${r.low}:${r.medium}:${r.high}`).join("|");
  useEffect(() => { scroller.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [signature]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      const el = scroller.current;
      if (!el || paused.current || el.scrollHeight <= el.clientHeight) return;
      if (el.scrollTop >= el.scrollHeight - el.clientHeight - 1) el.scrollTop = 0;
      else el.scrollTop += 1;
    }, 35);
    return () => clearInterval(timer);
  }, []);
  return <Panel title="筛查动态" sub="演示动态" className="min-h-[280px] flex-1" extra={<Button variant="screenQuiet" size="sm" aria-pressed={selectedOnly} className="h-7 px-2 text-[16.8px]" onClick={() => setSelectedOnly(v => !v)}>{selectedOnly ? `${city}市` : "全省"}</Button>}>
    <div ref={scroller} tabIndex={0} aria-label="自动滚动筛查动态" onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }} onFocus={() => { paused.current = true; }} onBlur={() => { paused.current = false; }} className="h-full overflow-y-auto overscroll-contain">{shown.map((r, index) => <Button key={`${r.city}-${r.time}`} variant="screenQuiet" className={`h-auto w-full justify-start gap-3 whitespace-normal rounded-none border-x-0 border-t-0 px-3 py-3 text-left ${r.city === city ? "bg-scr-line/15" : ""}`} onClick={() => onPick(r.city)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center"><ActivityIcon className="!h-5 !w-5 text-scr-cyan" /></span>
      <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><b className="text-[20.16px] text-scr-text">{r.community}</b><span className="text-[16.8px] text-scr-dim">{r.time.slice(11)}{index === 0 ? " · 最近更新" : ""}</span></span><span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[16.8px]"><ScreenMetric compact label="新增筛查" value={r.screened} /><ScreenMetric compact label="低风险" value={`+${r.low}`} /><ScreenMetric compact label="中风险" value={`+${r.medium}`} /><ScreenMetric compact label="高风险" value={`+${r.high}`} /><ScreenMetric compact label="待进一步评估" value={r.pending} /></span></span><ChevronRight className="!h-4 !w-4 shrink-0 text-scr-dim" />
    </Button>)}</div>
  </Panel>;
}

export function ProvinceRecent({ rows, overviewRows, city, period }: { rows: Activity[]; overviewRows: Activity[]; city: string; period: Period }) {
  const [distribution, setDistribution] = useState<"risk" | "concern">("risk");
  const totals = activityTotals(rows);
  const risks = [{ name: "低风险", value: totals.low }, { name: "中风险", value: totals.medium }, { name: "高风险", value: totals.high }, { name: "待进一步评估", value: totals.pending }];
  const data = distribution === "risk" ? risks : concernDistribution(rows);
  const colors = COLORS;
  const denominator = data.reduce((sum, r) => sum + r.value, 0);
  return <div className="province-right flex min-h-0 min-w-0 flex-col gap-3">
    <ProvinceOverview rows={overviewRows} />
    <Panel title="筛查结果" sub={`近${period === 1 ? "24小时" : `${period}日`}`} className="shrink-0"><div className="grid grid-cols-2 gap-3 py-2">{[{ label: "初筛阴性", value: totals.negative }, { label: "初筛阳性", value: totals.positive }, { label: "已完成风险分级", value: totals.low + totals.medium + totals.high }, { label: "待进一步评估", value: totals.pending }].map(item => <ScreenMetric key={item.label} {...item} />)}</div></Panel>
    <Panel title="区域分布" sub={`${city}市`} className="min-h-[370px] flex-[1.2]">
      <div className="screen-segments flex gap-1" aria-label="分布类别">{[{ key: "risk" as const, name: "认知风险" }, { key: "concern" as const, name: "关注项" }].map(item => <Button key={item.key} variant="screenQuiet" size="sm" aria-pressed={distribution === item.key} className={`h-7 px-3 text-[16.8px] ${distribution === item.key ? "text-scr-cyan" : "text-scr-dim"}`} onClick={() => setDistribution(item.key)}>{item.name}</Button>)}</div>
      <div className="relative h-[210px]"><ScreenChart label="区域风险与关注项分布" option={{ series: [{ type: "pie", radius: ["56%", "88%"], center: ["50%", "50%"], label: { show: false }, itemStyle: { borderWidth: 2, borderColor: chartColors().panel }, data: data.map((r, i) => ({ ...r, itemStyle: { color: chartColors().palette[i % 4] } })) }] }} /><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-[16.8px] text-scr-dim"><MetricLabel label="初筛阳性" /></span><b className="text-[33.6px] text-scr-text">{denominator}</b></div></div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-[16.8px]">{data.map((r, i) => <div key={r.name} className="flex flex-wrap items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: colors[i] }} /><span className="text-scr-dim"><MetricLabel label={r.name} /></span><b>{denominator ? Math.round(r.value / denominator * 100) : 0}%</b></div>)}</div>
      <p className="mt-2 text-[16.8px] text-scr-dim">{distribution === "concern" ? "主要关注项演示分布，不代表临床诊断" : "筛查阳性不等于已确定风险等级"}</p>
    </Panel>
  </div>;
}
export function ProvinceTrend({ rows, city, period, onPeriod }: { rows: Activity[]; city: string; period: Period; onPeriod: (period: Period) => void }) {
  const trend = activityTrend(rows);
  return (<Panel title={`${period === 1 ? "今日" : `近${period}日`}筛查趋势`} sub={`${city}市 · 人`} className="province-trend min-h-0 h-full">
      <div className="screen-segments mb-3 flex flex-wrap gap-1" aria-label="趋势统计周期">{PERIODS.map(p => <Button key={p} variant="screenQuiet" size="sm" aria-pressed={period === p} className={`h-7 px-2 text-[16.8px] ${period === p ? "text-scr-cyan" : "text-scr-dim"}`} onClick={() => onPeriod(p)}>{p === 1 ? "24小时" : `${p}日`}</Button>)}</div>
      <div className="h-[calc(100%-48px)] min-h-[200px]"><ScreenChart label="区域筛查趋势" option={{ grid: { top: 12, bottom: 28, left: 42, right: 12, containLabel: true }, tooltip: { trigger: "axis" }, xAxis: { type: "category", data: trend.map(d => d.date), axisLabel: { color: chartColors().dim, fontSize: 17 }, axisLine: { lineStyle: { color: chartColors().line } }, axisTick: { show: false } }, yAxis: { type: "value", axisLabel: { color: chartColors().dim, fontSize: 17 }, splitLine: { lineStyle: { color: chartColors().line, opacity: .2 } } }, series: [{ type: "bar", name: "筛查人数", data: trend.map(d => d.screened), barMaxWidth: 22, itemStyle: { color: chartColors().cyan, borderRadius: [3,3,0,0] } }, { type: "bar", name: "初筛阳性", data: trend.map(d => d.positive), barMaxWidth: 22, itemStyle: { color: chartColors().blue, borderRadius: [3,3,0,0] } }] }} /></div>
    </Panel>);
}

function ProvinceOverview({ rows }: { rows: Activity[] }) {
 const totals = activityTotals(rows);
 return (<Panel title="全省筛查概览" sub="近24小时" className="shrink-0">
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 py-2">{[{ label: "筛查人数", value: totals.screened }, { label: "低风险", value: totals.low }, { label: "中风险", value: totals.medium }, { label: "高风险", value: totals.high }].map(item => <ScreenMetric key={item.label} {...item} />)}</div>
      <div className="border-t border-scr-line/30 pt-2 text-[16.8px] text-scr-dim"><ScreenMetric compact label="阳性待评估" value={totals.pending} /><p className="mt-1">分级新增按评估结果统计</p></div>
    </Panel>);
}

function ProvinceRegulatory() {
  const [expandedIndicator, setExpandedIndicator] = useState<IndicatorKey>();
  const provinceCounts = demoRegulatoryCounts(276000);
  const selectedIndicator = INDICATORS.find(i => i.key === expandedIndicator);
 return (<Panel title="全省核心监管指标" sub="年度累计" className="province-regulatory shrink-0">
      <div className="divide-y divide-scr-line/20">{INDICATORS.map((indicator, index) => {
        const result = indicatorResult(provinceCounts, indicator.key);
        return <Button key={indicator.key} variant="screenQuiet" aria-expanded={expandedIndicator === indicator.key} className="h-auto w-full justify-between gap-3 whitespace-normal rounded-none px-1 py-3 text-left" onClick={() => setExpandedIndicator(expandedIndicator === indicator.key ? undefined : indicator.key)}>
          <span className="text-[18px] text-scr-text"><MetricLabel label={["认知初筛率", "阳性干预指导率", "疑似人群就诊率"][index]} /></span>
          <b className="province-rate shrink-0 text-[33.6px] tabular-nums text-scr-text">{result.value === null ? "—" : `${result.value}%`}</b>
        </Button>;
      })}</div>
      {selectedIndicator && <div className="space-y-2 border-t border-scr-line/20 py-3 text-[16.8px] leading-relaxed" aria-label="监管指标统计口径"><p>分子：{selectedIndicator.numeratorRule}</p><p>分母：{selectedIndicator.denominatorRule}</p><p className="text-scr-dim">{selectedIndicator.note}</p></div>}
      <p className="pt-2 text-[16.8px] text-scr-dim">江苏省 · 2026年1—10月 · 按人去重 · 演示数据</p>
    </Panel>);
}
