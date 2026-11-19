import { useState } from "react";
import { Loader2, Bot } from "lucide-react";
import ActionSheet from "@/components/nurse/ActionSheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useScaleAssessments } from "@/data/patients";
import { assessmentHistory, scaleDefinition } from "@/data/assessmentHistory";

type Reading = { summary: string; findings: { item: string; note: string }[]; strengths: string[]; suggestions: string[]; caution: string };

/** 底部弹出：某一量表的填写详情（最新在前，按文档分组逐项作答）+ 模型解读。 */
export default function ScaleDetailSheet({ patientId, scale, onClose }: { patientId: string; scale: string | null; onClose: () => void }) {
  const { data: records = [] } = useScaleAssessments(patientId);
  const [readings, setReadings] = useState<Record<string, Reading | string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const list = assessmentHistory(records).filter(r => r.scale.toLowerCase() === (scale ?? "").toLowerCase());
  const def = scaleDefinition(scale ?? "");

  const read = async (r: (typeof list)[number]) => {
    setLoading(r.id);
    const items = { 总分: `${r.total}${r.max ? `/${r.max}` : ""}`, 评分标准: def.criteria ?? "", 日期: r.created_at, 逐项: r.answers.map(a => `${a.group ? a.group + "｜" : ""}${a.question}：${a.answer}${a.score !== null ? `（${a.score}分）` : ""}`) };
    const { data, error } = await supabase.functions.invoke("cognitive-advice", { body: { patientId, mode: "scale", scaleName: `${r.name}（${def.desc ?? ""}）`, items } });
    setLoading(null);
    setReadings(x => ({ ...x, [r.id]: error || data?.error ? (data?.error ?? "解读失败，请稍后重试") : data.reading }));
  };

  return <ActionSheet open={!!scale} onOpenChange={v => !v && onClose()} title={`${list[0]?.name ?? def.scale?.name ?? def.questionnaire?.name ?? scale?.toUpperCase() ?? ""} · 量表填写详情`} description={list.length ? `共 ${list.length} 次评估` : undefined}>
    {(def.desc || def.criteria) && <div className="mb-3 rounded-lg bg-muted/60 p-2.5 text-xs leading-relaxed"><p className="font-semibold">{def.desc}</p>{def.criteria && <p className="mt-0.5 text-muted-foreground">评分标准：{def.criteria}</p>}</div>}
    {!list.length ? <p className="text-sm text-muted-foreground">暂无该量表的逐项填写记录</p> : list.map((r, i) => { const reading = readings[r.id]; return <details key={r.id} open={i === 0} className="mb-3 border-b pb-3">
      <summary className="cursor-pointer text-xs font-semibold">{new Date(r.created_at).toLocaleString("zh-CN")} · <span className="text-primary">{r.total}{r.max ? ` / ${r.max}` : ""} 分</span> · {r.assessed_by ?? "未记录"}</summary>
      <div className="mt-2 rounded-lg border border-primary/30 bg-primary/5 p-2.5 text-xs">
        <div className="flex items-center justify-between gap-2"><p className="flex items-center gap-1 font-semibold text-primary"><Bot className="h-4 w-4" />智能解读</p>
          {!reading || typeof reading === "string" ? <Button size="sm" variant="outline" className="h-7 text-xs" disabled={loading === r.id} onClick={() => read(r)}>{loading === r.id ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />解读中</> : "生成解读"}</Button> : null}</div>
        {typeof reading === "string" && <p className="mt-1 text-destructive">{reading}</p>}
        {reading && typeof reading !== "string" && <div className="mt-1.5 space-y-1.5 leading-relaxed">
          <p>{reading.summary}</p>
          {reading.findings.length > 0 && <div><p className="font-medium">失分 / 异常条目</p>{reading.findings.map((f, k) => <p key={k} className="text-muted-foreground">· {f.item}：{f.note}</p>)}</div>}
          {reading.strengths.length > 0 && <p><span className="font-medium">保留能力：</span>{reading.strengths.join("；")}</p>}
          {reading.suggestions.length > 0 && <div><p className="font-medium">建议</p>{reading.suggestions.map((s, k) => <p key={k} className="text-muted-foreground">{k + 1}. {s}</p>)}</div>}
          <p className="text-[13px] text-muted-foreground">{reading.caution}</p>
        </div>}
        {!reading && <p className="mt-1 text-muted-foreground">由通用大模型根据本次逐项作答生成，仅供参考，不作诊断。</p>}
      </div>
      {r.answers.length === 0 ? <p className="mt-2 text-xs text-muted-foreground">此记录仅保存总分</p> : <div className="mt-2 space-y-1.5">{r.answers.map((a, j) => <div key={j}>
        {a.group && a.group !== r.answers[j - 1]?.group && <p className="mb-1 mt-2 text-xs font-semibold text-primary">{a.group}</p>}
        <div className="rounded border-l-2 border-border p-2 text-xs"><p>{j + 1}. {a.question.replace(`${a.group} · `, "")}</p><p className="mt-0.5 text-primary">{a.answer}{a.score !== null && a.answer !== String(a.score) ? `（${a.score} 分）` : a.score !== null ? " 分" : ""}</p></div>
      </div>)}</div>}
    </details>; })}
  </ActionSheet>;
}
