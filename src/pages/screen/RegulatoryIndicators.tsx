import { useState } from "react";
import { ClipboardCheck, Info, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INDICATORS, indicatorResult, type Counts, type IndicatorKey } from "./regulatoryMetrics";

export default function RegulatoryIndicators({ counts, scope }: { counts: Counts; scope: string }) {
  const [expanded, setExpanded] = useState<IndicatorKey>();
  const selected = INDICATORS.find(i => i.key === expanded);
  const icons = [ClipboardCheck, Users, Stethoscope];
  return <section aria-label="三项核心监管指标" className="space-y-2">
    <div className="flex flex-wrap justify-between gap-2 text-xs text-scr-dim"><h2 className="font-bold text-scr-text">核心监管指标 · {scope}</h2><span>2026年1—10月 · 按人去重</span></div>
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">{INDICATORS.map((i, index) => {
      const result = indicatorResult(counts, i.key), Icon = icons[index];
      return <Button key={i.key} variant="screen" aria-expanded={expanded === i.key} className="scr-panel h-auto min-h-[132px] justify-start gap-3 whitespace-normal p-3 text-left" onClick={() => setExpanded(expanded === i.key ? undefined : i.key)}>
        <span className="province-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-scr-cyan/70"><Icon className="!h-6 !w-6 text-scr-cyan" /></span>
        <span className="min-w-0 flex-1"><span className="block text-xs leading-[1.75rem] text-scr-text">{i.label}</span><span className="block text-[36.4px] font-black text-scr-cyan">{result.value === null ? "暂无数据" : `${result.value}%`}</span><span className="block text-xs leading-[1.75rem] text-scr-dim">分子 {result.numerator.toLocaleString("zh-CN")} 人 / 分母 {result.denominator.toLocaleString("zh-CN")} 人</span></span><Info className="!h-4 !w-4 shrink-0 text-scr-dim" />
      </Button>;
    })}</div>
    {selected && <div className="border-y border-scr-line/40 px-3 py-3 text-sm leading-[2.1rem]" role="region" aria-label={`${selected.short}计算口径`}><h3 className="font-bold text-scr-cyan">{selected.label} · 计算口径</h3><p>分母：{selected.denominatorRule}</p><p>分子：{selected.numeratorRule}</p><p className="text-scr-gold">{selected.note}</p><p className="text-xs text-scr-dim">计算公式：分子 ÷ 分母 × 100%；分母为零显示暂无数据，不以零完成率替代。</p></div>}
  </section>;
}