import { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, Loader2, Check } from "lucide-react";
import DoctorBackButton from "@/components/doctor/DoctorBackButton";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePatient, useScaleAssessments } from "@/data/patients";
import { SCALES, scaleTotal, type ScaleKey } from "@/data/scales";
import { RISK_PLAN } from "@/data/cognitive";
import RiskAnalysisCard, { type RiskAnalysis } from "@/components/cognitive/RiskAnalysisCard";
import ActionSheet from "@/components/nurse/ActionSheet";
import { assessmentHistory } from "@/data/assessmentHistory";

/** 评估医生：逐项完成 SCD-Q9 / MMSE / MoCA / ADL，保存后由模型分析风险等级 */
export default function DoctorAssess() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const { data: p } = usePatient(id);
  const { data: history = [], isLoading: historyLoading, isError: historyError } = useScaleAssessments(id);
  const [chosen, setChosen] = useState<ScaleKey[]>([]);
  const [libOpen, setLibOpen] = useState(true);
  const [openH, setOpenH] = useState<string | null>(null);
  const [active, setActive] = useState<ScaleKey>("scd_q9");
  const [picks, setPicks] = useState<Record<ScaleKey, Record<number, number>>>({ scd_q9: {}, mmse: {}, moca: {}, adl: {} });
  const [done, setDone] = useState<Partial<Record<ScaleKey, number>>>({});
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  if (!p) return <p className="p-6 text-sm text-muted-foreground">加载中…</p>;
  const scale = SCALES.find((s) => s.key === active);
  if (!scale) return null;
  const allHistory = assessmentHistory(history);
  const selectedHistory = allHistory.find(h => h.id === openH);
  const cur = picks[active];
  const total = scaleTotal(scale, cur);
  const answered = Object.keys(cur).length;

  const save = async () => {
    if (total == null) return toast({ title: `还有 ${scale.items.length - answered} 项未评分` });
    setSaving(true);
    const items = Object.fromEntries(scale.items.map((it, i) => [it.label, cur[i]]));
    const { error } = await supabase.from("scale_assessments").insert({ patient_id: p.id, scale: active, items, total, assessed_by: "评估医生" });
    if (!error) await supabase.from("patients").update({ [active]: total } as never).eq("id", p.id);
    setSaving(false);
    if (error) return toast({ title: "保存失败", description: error.message });
    setDone({ ...done, [active]: total });
    qc.invalidateQueries({ queryKey: ["patient", p.id] }); qc.invalidateQueries({ queryKey: ["scale-assessments", p.id] }); qc.invalidateQueries({ queryKey: ["patients"] });
    toast({ title: `${scale.name} 已保存：${total} 分` });
    const next = SCALES.find((s) => chosen.includes(s.key) && s.key !== active && done[s.key] == null);
    if (next) setActive(next.key);
  };

  const analyze = async () => {
    setAnalyzing(true);
    const items = Object.fromEntries(SCALES.filter((s) => done[s.key] != null).map((s) => [s.name, Object.fromEntries(s.items.map((it, i) => [it.label, picks[s.key][i]]))]));
    const { data, error } = await supabase.functions.invoke("cognitive-advice", { body: { patientId: p.id, mode: "risk", items } });
    setAnalyzing(false);
    if (error || data?.error) {
      let msg = data?.error as string | undefined;
      try { msg = msg ?? (await (error as { context?: Response })?.context?.json())?.error; } catch { /* ignore */ }
      return toast({ title: "分析失败", description: msg ?? "请稍后重试" });
    }
    const risk = (data.analysis as RiskAnalysis).risk;
    await supabase.from("patients").update({ cognitive_risk: risk, next_reassess: RISK_PLAN[risk].reassess }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["patient", p.id] }); qc.invalidateQueries({ queryKey: ["patients"] });
    toast({ title: `模型分析：${(data.analysis as RiskAnalysis).risk}` });
  };

  return (
    <div className="min-h-full bg-muted/30">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-card px-4 py-3">
        <DoctorBackButton fallback={`/doctor/patients/${id}`} />
        <h2 className="text-base font-semibold">{p.name} · 量表评估</h2>
        <span className="w-10" />
      </div>
      <div className="space-y-3 p-3">
        <Card className="p-3 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">量表库 <span className="text-xs font-normal text-muted-foreground">选择本次要评估的量表</span></p>
            {chosen.length > 0 && <button className="text-xs text-primary" onClick={() => setLibOpen(!libOpen)}>{libOpen ? "收起" : "重新选择"}</button>}
          </div>
          {libOpen && <div className="mt-2 space-y-1.5">
            {SCALES.map((s) => { const on = chosen.includes(s.key); return (
              <button key={s.key} onClick={() => setChosen(on ? chosen.filter((k) => k !== s.key) : [...chosen, s.key])}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left ${on ? "border-primary bg-primary/10" : "bg-card"}`}>
                <span><span className="text-sm font-medium">{s.name}</span><br /><span className="text-[15.4px] text-muted-foreground">{s.desc} · 满分 {s.max} · {s.items.length} 项</span></span>
                <span className={`flex h-5 w-5 items-center justify-center rounded border ${on ? "border-primary bg-primary text-primary-foreground" : ""}`}>{on && <Check className="h-3 w-3" />}</span>
              </button>); })}
            <Button className="w-full" disabled={chosen.length === 0} onClick={() => { const first = SCALES.find((s) => chosen.includes(s.key)); if (first) { setLibOpen(false); setActive(first.key); } }}>开始评估（{chosen.length}）</Button>
          </div>}
        </Card>

        {!libOpen && chosen.length > 0 && <>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${chosen.length}, minmax(0, 1fr))` }}>
          {SCALES.filter((s) => chosen.includes(s.key)).map((s) => (
            <button key={s.key} onClick={() => setActive(s.key)}
              className={`rounded-lg border px-1 py-2 text-center ${active === s.key ? "border-primary bg-primary/10 text-primary" : "bg-card"}`}>
              <p className="text-[15.4px] font-semibold">{s.name.replace("（Barthel）", "")}</p>
              <p className="text-[14px] text-muted-foreground">{done[s.key] != null ? <span className="text-success">✓ {done[s.key]}</span> : p[s.key] != null ? `上次 ${p[s.key]}` : "未评"}</p>
            </button>
          ))}
        </div>

        <Card className="p-3 shadow-soft">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-semibold">{scale.name}</p><p className="text-[15.4px] text-muted-foreground">{scale.desc}</p></div>
            <p className="text-right"><span className="text-xl font-bold text-primary">{total ?? "—"}</span><span className="text-xs text-muted-foreground"> / {scale.max}</span><br /><span className="text-[14px] text-muted-foreground">{answered}/{scale.items.length} 项</span></p>
          </div>
          <div className="mt-3 space-y-2.5">
            {scale.items.map((it, i) => (
              <div key={it.label}>
                <p className="mb-1 text-xs">{i + 1}. {it.label}{it.hint && <span className="ml-1 text-muted-foreground">({it.hint})</span>}</p>
                <div className="flex flex-wrap gap-1">
                  {it.options.map((o) => (
                    <button key={o} onClick={() => setPicks({ ...picks, [active]: { ...cur, [i]: o } })}
                      className={`min-w-9 rounded-md border px-2 py-1 text-xs ${cur[i] === o ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-3 w-full" disabled={saving} onClick={save}><Check className="mr-1 h-4 w-4" />保存 {scale.name}</Button>
        </Card>
        </>}

        <Card className="p-3 shadow-soft">
          <p className="text-sm font-semibold">模型风险分析</p>
          <p className="mb-2 text-[15.4px] text-muted-foreground">完成量表后，由模型结合各项得分自动分析风险等级，风险等级自动更新到档案（已完成 {Object.keys(done).length}/{chosen.length || "-"}）</p>
          <Button className="w-full" variant="secondary" disabled={analyzing || Object.keys(done).length === 0} onClick={analyze}>
            {analyzing ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />分析中…</> : <><Sparkles className="mr-1 h-4 w-4" />完成评估并智能分析</>}
          </Button>
          {p.ai_risk && <div className="mt-3"><RiskAnalysisCard a={p.ai_risk as RiskAnalysis} at={p.ai_risk_at} current={p.cognitive_risk} /></div>}
        </Card>

        <Card className="p-3 shadow-soft">
          <p className="mb-1 text-sm font-semibold">历史量表记录 <span className="text-xs font-normal text-muted-foreground">({history.length})</span></p>
          {historyLoading ? <p className="text-xs text-muted-foreground">读取中…</p> : historyError ? <p className="text-xs text-destructive">记录读取失败，请重试</p> : allHistory.length === 0 ? <p className="text-xs text-muted-foreground">暂无历史量表记录</p> : allHistory.map(h => (
            <div key={h.id} className="flex items-center justify-between gap-2 border-b py-3 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{h.name} <span className="ml-1 text-primary">{h.total}{h.max ? ` / ${h.max}` : ""} 分</span></p>
                <p className="mt-1 break-words text-[15.4px] text-muted-foreground">{new Date(h.created_at).toLocaleString("zh-CN")} · {h.assessed_by ?? "评估人未记录"}</p>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0 text-primary" onClick={() => setOpenH(h.id)}>查看详情</Button>
            </div>
          ))}
        </Card>
      </div>
      <ActionSheet open={!!selectedHistory} onOpenChange={open => { if (!open) setOpenH(null); }} title={selectedHistory ? `${selectedHistory.name} · 历史记录` : "历史量表记录"}>
        {selectedHistory && <div className="space-y-3">
          <div className="border-b pb-3"><p className="text-lg font-semibold text-primary">{selectedHistory.total}{selectedHistory.max ? ` / ${selectedHistory.max}` : ""} 分</p><p className="mt-1 text-xs text-muted-foreground">{new Date(selectedHistory.created_at).toLocaleString("zh-CN")} · {selectedHistory.assessed_by ?? "评估人未记录"}</p></div>
          {selectedHistory.answers.length === 0 ? <p className="text-sm text-muted-foreground">此记录仅保存总分，未记录逐项作答。</p> : selectedHistory.answers.map((answer, index) => <div key={answer.question} className="border-b pb-3 last:border-0"><p className="text-sm">{index + 1}. {answer.question}</p><p className="mt-1 text-sm text-primary">{answer.answer}{answer.score !== null ? `（${answer.score} 分）` : ""}</p></div>)}
        </div>}
      </ActionSheet>
    </div>
  );
}
