import { Button } from "@/components/ui/button";

export type RiskAnalysis = { risk: "低风险" | "中风险" | "高风险"; summary: string; basis: string[]; impaired_domains: string[]; refer: boolean; next_step: string };

const tone = (r: string) => r === "高风险" ? "bg-destructive/15 text-destructive" : r === "中风险" ? "bg-warning/15 text-warning" : "bg-success/15 text-success";

export default function RiskAnalysisCard({ a, at, current, onAdopt }: { a: RiskAnalysis; at?: string | null; current?: string | null; onAdopt?: (r: RiskAnalysis["risk"]) => void }) {
  return (
    <div className="rounded-lg border bg-primary/5 p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-2 py-0.5 text-sm font-semibold ${tone(a.risk)}`}>{a.risk}</span>
        <span className="text-[14px] text-muted-foreground">{a.refer ? "需转诊确诊 · " : ""}{at ? new Date(at).toLocaleString("zh-CN") : ""}</span>
      </div>
      <p className="mt-2 leading-relaxed">{a.summary}</p>
      <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-muted-foreground">{a.basis.map((b) => <li key={b}>{b}</li>)}</ul>
      {a.impaired_domains.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{a.impaired_domains.map((d) => <span key={d} className="rounded bg-accent/10 px-1.5 py-0.5 text-accent">{d}</span>)}</div>}
      <p className="mt-2"><span className="font-medium">下一步：</span>{a.next_step}</p>
      {onAdopt && (current === a.risk
        ? <p className="mt-2 text-success">✓ 已确认为{a.risk}</p>
        : <Button size="sm" className="mt-2 w-full" onClick={() => onAdopt(a.risk)}>采纳为风险等级</Button>)}
      <p className="mt-1.5 text-[14px] text-muted-foreground">模型根据量表自动分级，结果已同步到档案</p>
    </div>
  );
}
