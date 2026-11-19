import { useState } from "react";
import { Sparkles, Loader2, Dumbbell, CalendarCheck, HeartHandshake, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import ActionSheet from "@/components/nurse/ActionSheet";
import { supabase } from "@/integrations/supabase/client";
import PlanView from "@/components/cognitive/PlanView";
import { useQueryClient } from "@tanstack/react-query";
import SelfAssessmentForm from "@/components/cognitive/SelfAssessmentForm";
import { useScaleAssessments } from "@/data/patients";
import { latestSelfAssessments } from "../../../supabase/functions/_shared/selfAssessment";
import { useNavigate } from "react-router-dom";

export type Advice = {
  summary: string; focus: string[];
  training: { domain: string; activity: string; frequency: string; duration: string; setting: string }[];
  followup: { cycle: string; reassess: string; items: string[] };
  caregiver_tips: string[]; red_flags: string[];
  interventions?: { category: string; actions: string[]; frequency: string; duration: string }[];
  self_assessments?: { name: string; total: number; assessed_at: string; assessed_by: string }[];
  doctor_assessments?: { name: string; total: number; assessed_at: string; assessed_by: string }[];
};


export default function AiAdvicePanel({ patientId, name, saved, savedAt, compact = false }: { patientId: string; name: string; saved?: unknown; savedAt?: string | null; compact?: boolean }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: records = [], isLoading: reading } = useScaleAssessments(patientId);
  const complete = latestSelfAssessments(records).every(x => x.record);
  const doctorComplete = records.some(r => ["scd_q9", "mmse", "moca", "adl"].includes(r.scale));
  const [needs, setNeeds] = useState("");
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<Advice | null>((saved as Advice) ?? null);

  const run = async () => {
    if (!complete) return toast({ title: "请先协助患者完成四份自评量表" });
    if (!doctorComplete) return toast({ title: "请先完成医生他评量表" });
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("cognitive-advice", { body: { patientId, careNeeds: needs.trim() } });
    setLoading(false);
    if (error || data?.error) {
      let msg = data?.error as string | undefined;
      try { msg = msg ?? (await (error as { context?: Response })?.context?.json())?.error; } catch { /* ignore */ }
      toast({ title: "生成失败", description: msg ?? "请稍后重试" });
      return;
    }
    setAdvice(data.advice);
    qc.invalidateQueries();
    setOpen(false);
  };

  return (
    <>
      <Card className="p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 font-semibold"><Sparkles className="h-4 w-4 text-primary" />{compact ? "AI 治疗方案" : "模型生成 · 康复训练方案"}</h3>
          <Button size="sm" disabled={reading} onClick={() => setOpen(true)}>{!complete ? "协助完成自评" : advice ? "重新生成" : "生成方案"}</Button>
        </div>
        {advice && savedAt && <p className="mt-1 text-[11px] text-muted-foreground">生成于 {new Date(savedAt).toLocaleString("zh-CN")} · 医生确认后下发</p>}
        {!advice && <p className="mt-2 text-xs text-muted-foreground">{name} · 尚无治疗方案</p>}
        {advice && !compact && (
          <div className="mt-3 space-y-3 text-sm">
            <PlanView advice={advice} />
            <p className="text-[10px] text-muted-foreground">AI 生成内容仅供参考，须经评估师/治疗管理师审核后执行。</p>
          </div>
        )}
      </Card>

      <ActionSheet open={open} onOpenChange={setOpen} title="患者自评与照护需求" description={`${name} · ${complete ? "已读取自评结果" : "请医生协助患者完成缺失问卷"}`}
        footer={<Button className="w-full" disabled={loading || !complete || !doctorComplete} onClick={run}>{loading ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />生成中…</> : "结合他评与自评生成治疗方案"}</Button>}>
        <div className="space-y-3">
          <section className="border-b pb-3"><p className="text-sm font-semibold">医生他评依据</p>{records.filter((r, i, all) => ["scd_q9", "mmse", "moca", "adl"].includes(r.scale) && all.findIndex(x => x.scale === r.scale) === i).map(r => <p key={r.id} className="mt-1 text-xs text-muted-foreground">{r.scale.toUpperCase()} · {r.total} 分 · {r.assessed_by}</p>)}{!doctorComplete && <p className="mt-1 text-xs text-warning">尚无医生他评记录</p>}<Button size="sm" variant="outline" className="mt-2" onClick={() => navigate(`/doctor/assess/${patientId}`)}>选择量表评估</Button></section>
          <SelfAssessmentForm patientId={patientId} assisted />
          <div>
            <p className="mb-1 text-sm font-medium">照护需求</p>
            <Textarea rows={3} maxLength={1000} value={needs} onChange={(e) => setNeeds(e.target.value)}
              placeholder="如：独居，女儿周末探望；夜间易走失；希望在家能做的训练…" />
          </div>
        </div>
      </ActionSheet>
    </>
  );
}
