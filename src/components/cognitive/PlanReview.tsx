import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PlanView from "@/components/cognitive/PlanView";
import type { Advice } from "@/components/cognitive/AiAdvicePanel";
import { useTreatmentPlans, type Patient } from "@/data/patients";
import { needsReferral } from "@/data/cognitive";

const fmt = (d: string) => new Date(d).toLocaleDateString("zh-CN");

/** 医生审核模块：当前认知治疗方案 + 确认 + 历史方案。患者详情与"方案"页共用。 */
export default function PlanReview({ p, showCurrent = true }: { p: Patient; showCurrent?: boolean }) {
  const qc = useQueryClient();
  const { data: history = [] } = useTreatmentPlans(p.id);
  const [open, setOpen] = useState<string | null>(null);
  const pending = !p.ai_plan_confirmed_at || (p.ai_plan_at && p.ai_plan_at > p.ai_plan_confirmed_at);
  const mustConfirm = needsReferral(p.cognitive_risk);

  const confirm = async () => {
    const now = new Date().toISOString();
    const { error } = await supabase.from("patients").update({ ai_plan_confirmed_at: now, ai_plan_confirmed_by: "评估医生" }).eq("id", p.id);
    if (error) return toast({ title: "确认失败", description: error.message });
    if (history[0]) await supabase.from("treatment_plans").update({ confirmed_at: now, confirmed_by: "评估医生" }).eq("id", history[0].id);
    qc.invalidateQueries();
    toast({ title: "治疗方案已确认", description: "社区护理康复端和家庭端将按此方案执行" });
  };

  return (
    <>
      {showCurrent && (
        <Card className="p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">认知治疗方案 · {p.cognitive_risk ?? "待分级"}</p>
            {p.ai_plan_at && <span className="text-[11px] text-muted-foreground">生成于 {fmt(p.ai_plan_at)}</span>}
          </div>
          {p.ai_plan ? <div className="mt-3"><PlanView advice={p.ai_plan as Advice} /></div>
            : <p className="mt-2 text-xs text-muted-foreground">尚未生成方案</p>}
        </Card>
      )}
      {p.ai_plan && (
        <Card className="flex items-center justify-between p-3 shadow-soft">
          <p className="text-xs">{!mustConfirm
            ? <span className="text-muted-foreground">低风险：由社区与家庭医生联合制定，无需上级医生确认</span>
            : !pending ? <span className="text-success">✓ 医生已确认 · {fmt(p.ai_plan_confirmed_at!)}</span>
            : <span className="text-warning">模型方案待医生确认，确认后下发执行</span>}</p>
          {mustConfirm && pending && <Button size="sm" onClick={confirm}>确认方案</Button>}
        </Card>
      )}
      <Card className="p-4 shadow-soft">
        <p className="mb-2 text-sm font-semibold">历史治疗方案 <span className="text-xs font-normal text-muted-foreground">({history.length})</span></p>
        {history.length === 0 ? <p className="text-xs text-muted-foreground">暂无历史方案</p> : history.map((h, i) => (
          <div key={h.id} className="border-b py-2 text-xs last:border-0">
            <button className="flex w-full items-center justify-between text-left" onClick={() => setOpen(open === h.id ? null : h.id)}>
              <span className="font-medium">{fmt(h.created_at)} · {h.risk ?? "—"}{i === 0 && <span className="ml-1 text-primary">当前</span>}</span>
              <span className={h.confirmed_at ? "text-success" : "text-muted-foreground"}>{h.confirmed_at ? `已确认 ${fmt(h.confirmed_at)}` : "未确认"} {open === h.id ? "▲" : "▼"}</span>
            </button>
            {open !== h.id && <p className="mt-0.5 line-clamp-1 text-muted-foreground">{(h.plan as Advice)?.summary}</p>}
            {open === h.id && <div className="mt-2"><PlanView advice={h.plan as Advice} /></div>}
          </div>
        ))}
      </Card>
    </>
  );
}
