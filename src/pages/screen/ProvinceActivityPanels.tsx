import { useEffect, useRef } from "react";
import { Activity as ActivityIcon, Brain, Info, ArrowUp, ArrowDown, Minus, HeartHandshake, Hospital, ShieldCheck, ShieldAlert, Users, UserCheck, Search, type LucideIcon } from "lucide-react";
import ScreenChart, { chartColors } from "./ScreenChart";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Panel } from "./screenKit";
import RollingCount from "./RollingCount";
import { activityRanking, activityTotals, activityTrend, PERIODS, type Activity, type Period } from "./provinceActivityData";
import { demoRegulatoryCounts, INDICATORS, indicatorResult } from "./regulatoryMetrics";

const DIMENSIONS = [
  { name: "语言表达", value: 64 }, { name: "物体认知", value: 81 }, { name: "计算能力", value: 89 },
  { name: "时间定向", value: 79 }, { name: "即时记忆", value: 80 }, { name: "延迟记忆", value: 51 }, { name: "注意力", value: 90 },
];

function ScreenMetric({ name, value, unit, icon: Icon }: { name: string; value: number | string; unit?: string; icon: LucideIcon }) {
  return <div className="screen-metric flex min-w-0 items-center gap-3">
    <span className="screen-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full" aria-hidden="true"><Icon className="!h-6 !w-6" strokeWidth={1.6} /></span>
    <div className="min-w-0"><b className="screen-metric-value flex items-baseline whitespace-nowrap text-[33.6px] font-bold leading-tight tabular-nums text-scr-text">{typeof value === "number" ? <RollingCount value={value} /> : value}{unit && <span className="ml-1 text-[16.8px] font-normal text-scr-dim">{unit}</span>}</b><span className="mt-1 block text-[16.8px] leading-relaxed text-scr-dim">{name}</span></div>
  </div>;
}

function ProvinceCoreIndicators() {
  const provinceCounts = demoRegulatoryCounts(276000);
  const icons = [Brain, HeartHandshake, Hospital];
  return <Panel title="全省核心监管指标" sub="年度累计" className="shrink-0">
    <div className="grid grid-cols-3 divide-x divide-scr-line/20 py-4">{INDICATORS.map((indicator, index) => {
      const result = indicatorResult(provinceCounts, indicator.key), Icon = icons[index];
      const name = ["认知初筛率", "阳性干预指导率", "疑似人群就诊率"][index];
      return <div key={indicator.key} className="flex min-w-0 flex-col items-center gap-3 px-2 text-center">
        <span className="screen-metric-icon flex h-11 w-11 items-center justify-center rounded-full" aria-hidden="true"><Icon className="!h-6 !w-6" strokeWidth={1.6} /></span>
        <b className="whitespace-nowrap text-[30px] font-bold leading-tight tabular-nums text-scr-text">{result.value === null ? "—" : `${result.value}%`}</b>
        <span className="flex min-w-0 flex-col items-center justify-center gap-2 text-[16.8px] leading-relaxed text-scr-dim"><span className="min-h-[50px]">{name}</span>
          <Tooltip><TooltipTrigger asChild><Button variant="screenQuiet" size="icon" aria-label={`${name}计算规则`} className="!h-6 !w-6 shrink-0 rounded-full"><Info className="!h-4 !w-4" /></Button></TooltipTrigger>
            <TooltipContent side="right" className="max-w-[420px] border-scr-line bg-scr-panel p-4 text-[16.8px] leading-relaxed text-scr-text">
              <div className="space-y-2"><b>{name} · 计算规则</b><p>计算公式：分子 ÷ 分母 × 100%</p><p>分子：{indicator.numeratorRule}</p><p>分母：{indicator.denominatorRule}</p><p>当前人数：{result.numerator.toLocaleString()} / {result.denominator.toLocaleString()} 人</p><p>{indicator.note}</p></div>
            </TooltipContent>
          </Tooltip>
        </span>
      </div>;
    })}</div>
    <p className="border-t border-scr-line/20 pt-2 text-[16.8px] text-scr-dim">江苏省 · 2026年1—10月 · 按人去重</p>
  </Panel>;
}

function RankingValue({ value, change }: { value: number; change: number | null }) {
  if (change === null) return <span className="whitespace-nowrap tabular-nums" title="前24小时数据未提供，暂不比较">{value}</span>;
  const Icon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;
  const description = change === 0 ? "与前24小时持平" : `较前24小时${change > 0 ? "增加" : "减少"}${Math.abs(change)}人`;
  return <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap tabular-nums" title={description}>{value}<Icon aria-label={description} className="!h-3 !w-3 text-scr-dim" strokeWidth={2} /></span>;
}

function ProvinceScreeningOverview({ rows }: { rows: Activity[] }) {
  const totals = activityTotals(rows);
  return <Panel title="全省筛查概览" sub="近24小时" className="shrink-0">
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 py-3">{[
      { name: "筛查人数", value: totals.screened, icon: Users },
      { name: "低风险", value: totals.low, icon: ShieldCheck },
      { name: "中风险", value: totals.medium, icon: ActivityIcon },
      { name: "高风险", value: totals.high, icon: ShieldAlert },
    ].map(item => <ScreenMetric key={item.name} {...item} unit="人" />)}</div>
    <p className="border-t border-scr-line/30 pt-2 text-[16.8px] text-scr-dim">分级新增按评估结果统计 · 阳性待评估 {totals.pending} 人</p>
  </Panel>;
}

export function ProvinceSummary({ rows, previousRows, city, onPick }: { rows: Activity[]; previousRows?: Activity[]; city: string; onPick: (city: string) => void }) {
  const ranking = activityRanking(rows, previousRows);
  return <div className="flex min-h-0 min-w-0 flex-col gap-3">
    <ProvinceCoreIndicators />
    <Panel title="认知功能维度分布" sub="正常表现占比" className="min-h-[330px] flex-1">
      <div className="h-full min-h-[285px]"><ScreenChart label="认知功能维度分布" option={{ radar: { indicator: DIMENSIONS.map(d => ({ name: `${d.name} ${d.value}%`, max: 100 })), radius: "62%", center: ["50%", "51%"], axisName: { color: chartColors().text, fontSize: 17 }, splitLine: { lineStyle: { color: chartColors().line, opacity: .35 } }, splitArea: { show: false } }, series: [{ type: "radar", data: [{ value: DIMENSIONS.map(d => d.value), name: "正常表现占比" }], symbolSize: 6, lineStyle: { color: chartColors().cyan, width: 2 }, itemStyle: { color: chartColors().cyan }, areaStyle: { color: chartColors().cyan, opacity: .15 } }] }} /></div>
    </Panel>
    <Panel title="筛查区域排行" sub="近24小时" className="min-h-[310px] flex-1">
      <div className="h-full min-h-0 overflow-auto"><table className="w-full text-[16.8px]"><thead className="sticky top-0 z-10 bg-scr-panel text-scr-dim"><tr>{["筛查区域", "总数", "低", "中", "高"].map(label => <th key={label} className="px-1 py-2 text-right font-normal first:text-left">{label}</th>)}</tr></thead><tbody>{ranking.map((r, index) => <tr key={r.name} className={`border-t border-scr-line/20 ${city === r.name ? "bg-scr-line/20" : ""}`}><td className="py-1"><Button variant="screenQuiet" className={`h-auto w-full justify-start gap-2 border-transparent px-1 py-2 text-[16.8px] ${city === r.name ? "text-scr-gold" : ""}`} onClick={() => onPick(r.name)}><span className="text-scr-dim">{index + 1}</span>{r.name === "南京" ? "小市社区 · 南京" : `${r.name}市`}</Button></td><td className="px-1 text-right tabular-nums text-scr-cyan"><RankingValue value={r.screened} change={r.changes.screened} /></td><td className="px-1 text-right text-scr-green"><RankingValue value={r.low} change={r.changes.low} /></td><td className="px-1 text-right text-scr-gold"><RankingValue value={r.medium} change={r.changes.medium} /></td><td className="px-1 text-right text-scr-red"><RankingValue value={r.high} change={r.changes.high} /></td></tr>)}</tbody></table></div>
    </Panel>
  </div>;
}

export function ScreeningFeed({ rows, city, onPick }: { rows: Activity[]; city: string; onPick: (city: string) => void }) {
  const shown = rows;
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
  return <Panel title="筛查动态" sub="近24小时" className="min-h-[280px] flex-1">
    <div ref={scroller} tabIndex={0} aria-label="自动滚动筛查动态" onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }} onFocus={() => { paused.current = true; }} onBlur={() => { paused.current = false; }} className="h-full overflow-y-auto overscroll-contain">{shown.map(r => <Button key={`${r.city}-${r.time}`} variant="screenQuiet" className={`h-auto min-h-[88px] w-full justify-start whitespace-normal rounded-none border-x-0 border-t-0 px-3 py-3 text-left ${r.city === city ? "bg-scr-line/15" : ""}`} onClick={() => onPick(r.city)}>
      <span className="screen-feed-row grid w-full min-w-0 items-center gap-x-4 gap-y-2"><b className="text-[20.16px] text-scr-text">{r.city === "南京" ? "小市社区 · 南京" : `${r.city}市`}</b><span className="text-[16.8px] text-scr-text">新增筛查 <b className="tabular-nums">{r.screened}</b> 人</span><span className="text-[16.8px] text-scr-text">低风险 +{r.low}</span><span className="text-[16.8px] text-scr-text">中风险 +{r.medium}</span><span className="text-[16.8px] text-scr-text">高风险 +{r.high}</span></span>
    </Button>)}</div>
  </Panel>;
}

export function ProvinceRecent({ rows, recentRows, city, period, onPeriod }: { rows: Activity[]; recentRows: Activity[]; city: string; period: Period; onPeriod: (period: Period) => void }) {
  const totals = activityTotals(rows), trend = activityTrend(rows);
  const data = [{ name: "低风险", value: totals.low }, { name: "中风险", value: totals.medium }, { name: "高风险", value: totals.high }];
  const denominator = data.reduce((sum, r) => sum + r.value, 0);
  return <div className="province-right flex min-h-0 min-w-0 flex-col gap-3">
    <ProvinceScreeningOverview rows={recentRows} />
    <Panel title={`${period === 1 ? "今日" : `近${period}日`}筛查趋势`} sub={`${city}市 · 人`} className="min-h-[290px] flex-1">
      <div className="screen-segments mb-3 flex flex-wrap gap-1" aria-label="趋势统计周期">{PERIODS.map(p => <Button key={p} variant="screenQuiet" size="sm" aria-pressed={period === p} className={`h-7 px-2 text-[16.8px] ${period === p ? "text-scr-cyan" : "text-scr-dim"}`} onClick={() => onPeriod(p)}>{p === 1 ? "24小时" : `${p}日`}</Button>)}</div>
      <div className="h-[calc(100%-48px)] min-h-[200px]"><ScreenChart label="区域筛查趋势" option={{ grid: { top: 12, bottom: 30, left: 36, right: 8 }, tooltip: { trigger: "axis" }, xAxis: { type: "category", data: trend.map(d => d.date), axisLabel: { color: chartColors().dim, fontSize: 17 }, axisLine: { lineStyle: { color: chartColors().line } }, axisTick: { show: false } }, yAxis: { type: "value", axisLabel: { color: chartColors().dim, fontSize: 17 }, splitLine: { lineStyle: { color: chartColors().line, opacity: .2 } } }, series: [{ type: "bar", name: "筛查人数", data: trend.map(d => d.screened), barMaxWidth: 22, itemStyle: { color: chartColors().cyan, borderRadius: [3,3,0,0] } }, { type: "bar", name: "初筛阳性", data: trend.map(d => d.positive), barMaxWidth: 22, itemStyle: { color: chartColors().blue, borderRadius: [3,3,0,0] } }] }} /></div>
    </Panel>
    <Panel title="筛查结果" sub={`近${period === 1 ? "24小时" : `${period}日`}`} className="shrink-0">
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 py-3">{[
        { name: "初筛阴性", value: totals.negative, icon: ShieldCheck },
        { name: "初筛阳性", value: totals.positive, icon: ShieldAlert },
        { name: "已完成风险分级", value: totals.low + totals.medium + totals.high, icon: UserCheck },
        { name: "待进一步评估", value: totals.pending, icon: Search },
      ].map(item => <ScreenMetric key={item.name} {...item} unit="人" />)}</div>
    </Panel>
    <Panel title="区域风险分布" sub={`${city}市`} className="min-h-[370px] flex-[1.2]">
      <div className="relative h-[240px]"><ScreenChart label="区域风险分布" option={{ series: [{ type: "pie", radius: ["56%", "88%"], center: ["50%", "50%"], label: { show: true, position: "inside", formatter: "{d}%", color: chartColors().text, fontSize: 17, fontWeight: 600 }, itemStyle: { borderWidth: 2, borderColor: chartColors().panel }, data: data.map((r, i) => ({ ...r, itemStyle: { color: i % 2 === 0 ? chartColors().cyan : chartColors().blue, opacity: 1 - i * .2 } })) }] }} /><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><b className="text-[33.6px] text-scr-text">{denominator}</b><span className="text-[16.8px] text-scr-dim">已完成风险分级</span></div></div>
      <div className="space-y-3 text-[16.8px]">{data.map(r => <div key={r.name} className="flex items-center justify-between gap-2"><span className="text-scr-dim">{r.name}</span><span className="tabular-nums text-scr-text">{r.value} 人 <b className="ml-3">{denominator ? Math.round(r.value / denominator * 100) : 0}%</b></span></div>)}</div>
    </Panel>
  </div>;
}