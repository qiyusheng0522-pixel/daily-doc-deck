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

export type Advice = {
  summary: string; focus: string[];
  training: { domain: string; activity: string; frequency: string; duration: string; setting: string }[];
  followup: { cycle: string; reassess: string; items: string[] };
  caregiver_tips: string[]; red_flags: string[];
};

const AREAS = ["睡眠", "营养", "跌倒风险", "精神心理"] as const;
const LEVELS = ["正常", "轻度", "中度", "重度"];

export default function AiAdvicePanel({ patientId, name, saved, savedAt }: { patientId: string; name: string; saved?: unknown; savedAt?: string | null }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [self, setSelf] = useState<Record<string, number>>({ 睡眠: 0, 营养: 0, 跌倒风险: 0, 精神心理: 0 });
  const [needs, setNeeds] = useState("");
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<Advice | null>((saved as Advice) ?? null);

  const run = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("cognitive-advice", { body: { patientId, self, careNeeds: needs.trim() } });
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
          <h3 className="flex items-center gap-1.5 font-semibold"><Sparkles className="h-4 w-4 text-primary" />模型生成 · 康复训练方案</h3>
          <Button size="sm" onClick={() => setOpen(true)}>{advice ? "重新生成" : "录入并生成"}</Button>
        </div>
        {advice && savedAt && <p className="mt-1 text-[11px] text-muted-foreground">已同步家庭端 · 生成于 {new Date(savedAt).toLocaleString("zh-CN")}</p>}
        {!advice && <p className="mt-2 text-xs text-muted-foreground">录入{name}的老年综合评估自评与照护需求，结合量表结果生成个性化方案，供评估师审核后执行。</p>}
        {advice && (
          <div className="mt-3 space-y-3 text-sm">
            <PlanView advice={advice} />
            <p className="text-[10px] text-muted-foreground">AI 生成内容仅供参考，须经评估师/治疗管理师审核后执行。</p>
          </div>
        )}
      </Card>

      <ActionSheet open={open} onOpenChange={setOpen} title="录入自评与照护需求" description={`${name} · 老年综合评估自评结果`}
        footer={<Button className="w-full" disabled={loading} onClick={run}>{loading ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />生成中…</> : "生成个性化建议"}</Button>}>
        <div className="space-y-3">
          {AREAS.map((a) => (
            <div key={a}>
              <p className="mb-1 text-sm font-medium">{a}</p>
              <div className="grid grid-cols-4 gap-1.5">
                {LEVELS.map((l, i) => (
                  <button key={l} onClick={() => setSelf({ ...self, [a]: i })}
                    className={`rounded-md border py-1.5 text-xs ${self[a] === i ? "border-primary bg-primary/10 font-medium text-primary" : "border-border"}`}>{l}</button>
                ))}
              </div>
            </div>
          ))}
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
