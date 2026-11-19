import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ActionSheet from "@/components/nurse/ActionSheet";
import type { Advice } from "./AiAdvicePanel";
import { editablePlan, planEditError } from "@/data/treatmentPlan";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";
import type { Patient } from "@/data/patients";

export default function PlanEditor({ p, onClose }: { p: Patient; onClose: () => void }) {
  const [draft, setDraft] = useState(() => editablePlan(p.ai_plan as Advice | null, p.cognitive_risk));
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const lines = (value: string) => value.split("\n");
  const save = async () => {
    const message = planEditError(draft, p.cognitive_risk);
    if (message) return toast({ title: message });
    setSaving(true);
    const { error } = await supabase.rpc("save_treatment_revision", { _patient_id: p.id, _plan: { ...draft, edited_by: "评估医生", edited_at: new Date().toISOString() } as unknown as Json, _expected_at: p.ai_plan_at ?? undefined });
    setSaving(false);
    if (error) return toast({ title: "保存失败", description: error.message });
    await qc.invalidateQueries();
    toast({ title: "修改已保存为新版本", description: "请确认后下发，原方案保留在历史记录中" });
    onClose();
  };
  return <ActionSheet open onOpenChange={v => !v && !saving && onClose()} title="编辑治疗方案" footer={<Button className="w-full" disabled={saving} onClick={save}>{saving ? "保存中…" : "保存修改"}</Button>}>
    <div className="space-y-4 text-xs">
      <label className="block">方案概要<Textarea aria-label="方案概要" className="mt-1" value={draft.summary} onChange={e => setDraft({ ...draft, summary: e.target.value })} /></label>
      {draft.interventions?.map((item, i) => {
        const update = (patch: Partial<typeof item>) => setDraft({ ...draft, interventions: draft.interventions?.map((x, j) => j === i ? { ...x, ...patch } : x) });
        return <section key={i} className="border-b pb-3"><h4 className="mb-2 font-semibold text-primary">{item.category}</h4>
          <label>具体方案内容<Textarea aria-label={`${item.category}内容`} className="mt-1" rows={4} value={item.actions.join("\n")} onChange={e => update({ actions: lines(e.target.value) })} /></label>
          <div className="mt-2 grid grid-cols-2 gap-2"><label>频次<Input aria-label={`${item.category}频次`} value={item.frequency} onChange={e => update({ frequency: e.target.value })} /></label><label>时长 / 疗程<Input aria-label={`${item.category}时长`} value={item.duration} onChange={e => update({ duration: e.target.value })} /></label></div>
        </section>;
      })}
      <div className="flex items-center justify-between"><h4 className="font-semibold">具体认知训练</h4><Button size="sm" variant="outline" onClick={() => setDraft({ ...draft, training: [...draft.training, { domain: "记忆", activity: "", setting: "站内小组", frequency: "", duration: "" }] })}><Plus className="mr-1 h-3 w-3" />添加训练</Button></div>
      {draft.training.map((t, i) => {
        const update = (patch: Partial<typeof t>) => setDraft({ ...draft, training: draft.training.map((x, j) => j === i ? { ...x, ...patch } : x) });
        return <section key={i} className="space-y-2 border-b pb-3"><div className="flex items-center justify-between"><span>训练 {i + 1}</span><Button variant="ghost" size="icon" aria-label={`删除训练${i + 1}`} onClick={() => setDraft({ ...draft, training: draft.training.filter((_, j) => i !== j) })}><Trash2 className="h-4 w-4" /></Button></div>
          <div className="grid grid-cols-2 gap-2"><label>训练领域<select className="mt-1 h-9 w-full rounded-md border bg-background px-2" value={t.domain} onChange={e => update({ domain: e.target.value })}>{["记忆", "注意力", "执行功能", "定向力", "视空间", "语言", "计算", "逻辑与问题解决"].map(x => <option key={x}>{x}</option>)}</select></label><label>执行场景<select className="mt-1 h-9 w-full rounded-md border bg-background px-2" value={t.setting} onChange={e => update({ setting: e.target.value })}>{["站内小组", "站内个训", "家庭作业", "家庭病床", "上门康复"].map(x => <option key={x}>{x}</option>)}</select></label></div>
          <label className="block">训练名称、材料、步骤与目标<Textarea aria-label={`训练${i + 1}内容`} rows={5} value={t.activity} onChange={e => update({ activity: e.target.value })} /></label>
          <div className="grid grid-cols-2 gap-2"><label>频次<Input aria-label={`训练${i + 1}频次`} value={t.frequency} onChange={e => update({ frequency: e.target.value })} /></label><label>时长<Input aria-label={`训练${i + 1}时长`} value={t.duration} onChange={e => update({ duration: e.target.value })} /></label></div>
        </section>;
      })}
      <label className="block">重点问题<Textarea value={draft.focus.join("\n")} onChange={e => setDraft({ ...draft, focus: lines(e.target.value) })} /></label>
      <h4 className="font-semibold">随访安排</h4><div className="grid grid-cols-2 gap-2"><label>随访频次<Input value={draft.followup.cycle} onChange={e => setDraft({ ...draft, followup: { ...draft.followup, cycle: e.target.value } })} /></label><label>复评周期<Input value={draft.followup.reassess} onChange={e => setDraft({ ...draft, followup: { ...draft.followup, reassess: e.target.value } })} /></label></div>
      <label className="block">随访内容<Textarea value={draft.followup.items.join("\n")} onChange={e => setDraft({ ...draft, followup: { ...draft.followup, items: lines(e.target.value) } })} /></label>
      <label className="block">照护者要点<Textarea value={draft.caregiver_tips.join("\n")} onChange={e => setDraft({ ...draft, caregiver_tips: lines(e.target.value) })} /></label>
      <label className="block">警示事项<Textarea value={draft.red_flags.join("\n")} onChange={e => setDraft({ ...draft, red_flags: lines(e.target.value) })} /></label>
    </div>
  </ActionSheet>;
}