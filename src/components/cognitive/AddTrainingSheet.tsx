import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ActionSheet from "@/components/nurse/ActionSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Kind = "设备训练" | "非设备干预";
type Preset = { domain: string; activity: string; setting: string; duration: number; feedback: string; fromPlan?: boolean };

/** 训练内容示例：设备训练记录结果，非设备干预记录过程描述。 */
export const TRAINING_PRESETS: Record<Kind, Preset[]> = {
  设备训练: [
    { domain: "记忆", activity: "数字记忆广度训练", setting: "站内设备", duration: 20, feedback: "正确率 78%，难度 L3" },
    { domain: "注意", activity: "视觉搜索专注训练", setting: "站内设备", duration: 15, feedback: "正确率 85%，反应时 1.2s" },
    { domain: "执行", activity: "路径规划训练", setting: "站内设备", duration: 20, feedback: "完成 6/8 关" },
  ],
  非设备干预: [
    { domain: "记忆", activity: "图片配对与延迟回忆", setting: "站内小组", duration: 25, feedback: "6张生活图片观察1分钟，遮盖后回忆，完成3轮。" },
    { domain: "注意力", activity: "数字划消", setting: "站内个训", duration: 20, feedback: "在数字表中圈出指定数字，练习3轮，第二轮需口头提示。" },
    { domain: "执行功能", activity: "模拟买菜", setting: "家庭任务", duration: 20, feedback: "按购物清单挑选物品并计算总价，家属协助核对。" },
  ],
};

export default function AddTrainingSheet({ patientId, open, onClose, planItems = [] }: { patientId: string; open: boolean; onClose: () => void; planItems?: { domain: string; activity: string; setting: string }[] }) {
  const qc = useQueryClient();
  const now = () => ({ date: new Date().toLocaleDateString("en-CA"), time: new Date().toTimeString().slice(0, 5) });
  const [kind, setKind] = useState<Kind>("设备训练");
  const [f, setF] = useState({ ...TRAINING_PRESETS.设备训练[0], ...now(), completion: "完成" });
  const [saving, setSaving] = useState(false);
  const presets: Preset[] = kind === "设备训练" ? TRAINING_PRESETS.设备训练 : [...planItems.map(t => ({ domain: t.domain, activity: t.activity.slice(0, 20), setting: t.setting === "家庭作业" ? "家庭任务" : t.setting, duration: 20, feedback: "", fromPlan: true })), ...TRAINING_PRESETS.非设备干预];
  const pick = (k: Kind, p: Preset) => setF(x => ({ ...x, ...p }));
  const save = async () => {
    if (!f.domain.trim() || !f.activity.trim() || !f.date || !f.time || !(f.duration > 0)) return toast({ title: "请填写训练项目、日期、时间和时长" });
    setSaving(true);
    const { error } = await supabase.from("training_records").insert({ patient_id: patientId, record_type: kind === "设备训练" ? "设备训练" : "非设备干预", trained_on: f.date, training_time: f.time, domain: f.domain.trim().slice(0, 20), activity: f.activity.trim().slice(0, 60), setting: kind === "设备训练" ? "站内设备" : f.setting, duration_min: f.duration, completion: f.completion, operator: "社区护理康复", feedback: f.feedback.trim().slice(0, 500) || null });
    setSaving(false);
    if (error) return toast({ title: "保存失败", description: error.message });
    qc.invalidateQueries();
    toast({ title: "训练记录已添加" });
    onClose();
  };
  const chip = (on: boolean) => cn("rounded-full border px-3 py-1.5 text-sm", on ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted");
  return <ActionSheet open={open} onOpenChange={v => !v && onClose()} title="添加训练记录" footer={<Button className="w-full" disabled={saving} onClick={save}>{saving ? "保存中…" : "保存记录"}</Button>}>
    <div className="space-y-4 text-sm">
      <div className="flex gap-2">{(["设备训练", "非设备干预"] as Kind[]).map(k => <button key={k} type="button" className={chip(kind === k)} onClick={() => { setKind(k); setF(x => ({ ...x, ...TRAINING_PRESETS[k][0], feedback: TRAINING_PRESETS[k][0].feedback })); }}>{k === "设备训练" ? "设备训练记录" : "非设备干预记录"}</button>)}</div>
      <div><p className="mb-2 font-medium">训练内容（点选示例后可修改）</p><div className="flex flex-wrap gap-2">{presets.map((p, i) => <button key={i} type="button" className={chip(f.domain === p.domain && f.activity === p.activity)} onClick={() => pick(kind, p)}>{p.fromPlan && "方案 · "}{p.domain} · {p.activity}</button>)}</div></div>
      <div className="grid grid-cols-2 gap-3">
        <label>训练领域<Input className="mt-1" value={f.domain} onChange={e => setF({ ...f, domain: e.target.value })} /></label>
        <label>训练项目<Input className="mt-1" value={f.activity} onChange={e => setF({ ...f, activity: e.target.value })} /></label>
        <label>训练日期<Input className="mt-1" type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></label>
        <label>训练时间<Input className="mt-1" type="time" value={f.time} onChange={e => setF({ ...f, time: e.target.value })} /></label>
        <label>时长（分钟）<Input className="mt-1" type="number" min={1} value={f.duration} onChange={e => setF({ ...f, duration: Number(e.target.value) })} /></label>
        {kind === "非设备干预" ? <label>执行场景<select className="mt-1 h-10 w-full rounded-md border bg-background px-2" value={f.setting} onChange={e => setF({ ...f, setting: e.target.value })}>{["站内小组", "站内个训", "家庭任务", "上门康复"].map(x => <option key={x}>{x}</option>)}</select></label> : <span />}
      </div>
      <div><p className="mb-2">完成情况</p><div className="flex gap-2">{["完成", "部分完成", "未完成"].map(c => <button key={c} type="button" className={chip(f.completion === c)} onClick={() => setF({ ...f, completion: c })}>{c}</button>)}</div></div>
      <label className="block">{kind === "设备训练" ? "训练结果（如 正确率 80%，难度 L3）" : "过程描述"}<Textarea className="mt-1" rows={3} maxLength={500} value={f.feedback} onChange={e => setF({ ...f, feedback: e.target.value })} /></label>
    </div>
  </ActionSheet>;
}
