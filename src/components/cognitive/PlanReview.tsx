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
import { TREATMENT_PROTOCOL } from "../../../supabase/functions/_shared/treatment";
import PlanEditor from "./PlanEditor";
import { planEditError, treatmentCategories } from "@/data/treatmentPlan";
import ActionSheet from "@/components/nurse/ActionSheet";

const fmt = (d: string) => new Date(d).toLocaleDateString("zh-CN");

/** 医生审核模块：当前认知治疗方案 + 确认 + 历史方案。患者详情与"方案"页共用。 */
export default function PlanReview({ p, showCurrent = true, historyOnly = false }: { p: Patient; showCurrent?: boolean; historyOnly?: boolean }) {
  const qc = useQueryClient();
  const { data: history = [] } = useTreatmentPlans(p.id);
  const [open, setOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const selectedHistory = history.find(h => h.id === open);
  const pending = !p.ai_plan_confirmed_at || (p.ai_plan_at && p.ai_plan_at > p.ai_plan_confirmed_at);
  const mustConfirm = needsReferral(p.cognitive_risk);

  const confirm = async () => {
    if (saving || !p.ai_plan || !mustConfirm) return;
    const message = planEditError(p.ai_plan as Advice, p.cognitive_risk);
    if (message) return toast({ title: "请先补全方案", description: message });
    setSaving(true);
    const now = new Date().toISOString();
    if (history[0]) {
      const { error } = await supabase.from("treatment_plans").update({ confirmed_at: now, confirmed_by: "评估医生" }).eq("id", history[0].id);
      if (error) { setSaving(false); return toast({ title: "确认失败", description: error.message }); }
    }
    const { error } = await supabase.from("patients").update({ ai_plan_confirmed_at: now, ai_plan_confirmed_by: "评估医生" }).eq("id", p.id);
    setSaving(false);
    if (error) return toast({ title: "确认失败", description: error.message });
    qc.invalidateQueries();
    toast({ title: "治疗方案已确认", description: "社区护理康复端和家庭端将按此方案执行" });
  };

  return (
    <>
      {showCurrent && !historyOnly && (
        <Card className="p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">认知治疗方案 · {p.cognitive_risk ?? "待分级"}</p>
            {p.ai_plan_at && <span className="text-[11px] text-muted-foreground">生成于 {fmt(p.ai_plan_at)}</span>}
          </div>
          <div role="button" tabIndex={0} aria-label="点击编辑治疗方案" className="mt-3 cursor-pointer rounded-lg transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setEditing(true)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setEditing(true); } }}>
            <p className="mb-1 text-[11px] text-muted-foreground">点击此处编辑方案与训练内容</p>
            {p.ai_plan ? <>
              {treatmentCategories(p.cognitive_risk).filter(c => !(p.ai_plan as Advice).interventions?.some(x => x.category === c)).map(c => <section key={c} className="mb-2 border-b pb-2 text-xs"><h4 className="font-semibold text-primary">{c}</h4><p className="mt-1 text-warning">此旧版本未生成该类型内容，请重新生成或由医生编辑补全。</p></section>)}
              <PlanView advice={p.ai_plan as Advice} /></>
              : <><TypeDetails p={p} /><p className="mt-2 text-xs text-muted-foreground">尚未生成个性化方案，以上仅为服务标准，不是患者训练内容。请结合医生他评与患者自评生成。</p></>}
          </div>
        </Card>
      )}
      {p.ai_plan && !historyOnly && (
        <Card className="flex items-center justify-between p-3 shadow-soft">
          <p className="text-xs">{!mustConfirm
            ? <span className="text-muted-foreground">低风险：由社区与家庭医生联合制定，无需上级医生确认</span>
            : !pending && p.ai_plan_confirmed_at ? <span className="text-success">✓ 医生已确认 · {fmt(p.ai_plan_confirmed_at)}</span>
            : <span className="text-warning">模型方案待医生确认，确认后下发执行</span>}</p>
          {mustConfirm && pending && <Button size="sm" disabled={saving} onClick={confirm}>{saving ? "确认中…" : "确认方案"}</Button>}
        </Card>
      )}
      <Card className="p-4 shadow-soft">
        <p className="mb-2 text-sm font-semibold">{historyOnly ? "方案记录" : "历史治疗方案"} <span className="text-xs font-normal text-muted-foreground">({history.length})</span></p>
        {history.length === 0 ? <p className="text-xs text-muted-foreground">暂无历史方案</p> : history.map(h => (
          <div key={h.id} className="border-b py-2 text-xs last:border-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{fmt(h.created_at)}</span>
              <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setOpen(h.id)}>查看详情</Button>
            </div>
          </div>
        ))}
      </Card>
      {selectedHistory && <ActionSheet open onOpenChange={value => !value && setOpen(null)} title="历史治疗方案详情" description={`${p.name} · ${fmt(selectedHistory.created_at)}`}>
        <PlanView advice={selectedHistory.plan as Advice} />
      </ActionSheet>}
      {editing && <PlanEditor p={p} onClose={() => setEditing(false)} />}
    </>
  );
}

const STANDARD: Record<string, string[]> = {
  认知训练: ["每周 1-3 次，每次 20-30 分钟", "累计 20-36 小时/期", "6-12 人小组制，覆盖记忆、注意、执行等领域"],
  其他非药物干预: ["音乐、怀旧、运动等非药物干预", "结合兴趣安排，每周至少 1 次"],
  家庭作业: ["每周 1-2 次，每次 20-30 分钟", "家属协助完成并记录"],
  风险因素管理: ["血压、血糖、血脂监测与控制", "戒烟限酒、规律体力活动"],
  睡眠: ["规律作息，保证夜间睡眠 6-8 小时", "减少日间久睡"],
  营养: ["地中海/MIND 饮食模式", "定期评估体重与营养状况"],
  心理: ["筛查焦虑抑郁情绪", "鼓励社交参与，必要时心理疏导"],
  长期护理或家庭病床服务: ["纳入长期护理或家庭病床服务", "每 3 个月复评"],
  家庭病床准入评估: ["评估行动能力与居家条件", "符合准入条件的行动不便对象纳入家庭病床"],
  上门评估与康复干预: ["家庭病床框架内定期上门评估", "上门开展康复与认知干预"],
};

function TypeDetails({ p }: { p: Patient }) {
  const proto = TREATMENT_PROTOCOL[p.cognitive_risk === "高风险" ? "高风险" : "中风险"];
  const ai = (p.ai_plan as Advice | null)?.interventions ?? [];
  const match = (c: string) => ai.find((x) => x.category.includes(c) || c.includes(x.category));
  return (
    <div className="mt-3 space-y-2 border-b pb-3">
      <p className="text-xs font-medium">治疗类型及方案内容</p>
      {proto.categories.map((c) => {
        const m = match(c);
        return (
          <div key={c} className="rounded-lg border p-2.5">
            <div className="flex items-center justify-between">
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{c}</span>
              <span className="text-[11px] text-muted-foreground">{m ? "AI生成" : "标准内容"}</span>
            </div>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs">{(m ? m.actions : STANDARD[c] ?? []).map((a, i) => <li key={i}>{a}</li>)}</ul>
            {m && <p className="mt-1 text-[11px] text-muted-foreground">{m.frequency} · {m.duration}</p>}
          </div>
        );
      })}
    </div>
  );
}
