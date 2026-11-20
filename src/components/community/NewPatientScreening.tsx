import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Info } from "lucide-react";
import ActionSheet from "@/components/nurse/ActionSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AD8_ITEMS } from "@/data/cognitive";
import { cn } from "@/lib/utils";

const STEPS = ["填写患者信息", "AD-8 评估", "完成并建档"];
export const ageFromBirth = (birth: string, today = new Date()) => { const b = new Date(birth); let a = today.getFullYear() - b.getFullYear(); if (today < new Date(today.getFullYear(), b.getMonth(), b.getDate())) a--; return a; };

export default function NewPatientScreening({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const empty = { name: "", phone: "", gender: "女", birth: "", community: "小市社区" };
  const [step, setStep] = useState(0);
  const [f, setF] = useState(empty);
  const [ans, setAns] = useState<(boolean | null)[]>(AD8_ITEMS.map(() => null));
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [deferred, setDeferred] = useState(false);
  const total = ans.filter(Boolean).length;
  const close = () => { setStep(0); setF(empty); setAns(AD8_ITEMS.map(() => null)); setCreated(null); setDeferred(false); onClose(); };
  const next = () => {
    if (!f.name.trim()) return toast({ title: "请输入患者姓名" });
    if (!/^1\d{10}$/.test(f.phone)) return toast({ title: "请输入 11 位手机号" });
    if (!f.birth || ageFromBirth(f.birth) < 18) return toast({ title: "请选择正确的出生日期" });
    setStep(1);
  };
  const saveForAssessment = async () => {
    if (!f.name.trim() || !/^1\d{10}$/.test(f.phone) || !f.birth || ageFromBirth(f.birth) < 18) return toast({ title: "请填写正确的姓名、手机号和出生日期" });
    setSaving(true);
    const { data, error } = await supabase.from("patients").insert({ name: f.name.trim().slice(0, 20), phone: f.phone, gender: f.gender, age: ageFromBirth(f.birth), diagnosis: "待进一步评估", source: "小市社区", community_stage: "新接收" }).select("id").single();
    setSaving(false);
    if (error || !data) return toast({ title: "建档失败", description: error?.message });
    qc.invalidateQueries(); setCreated(data.id); setDeferred(true); setStep(2);
  };
  const submit = async () => {
    if (ans.some(a => a === null)) return toast({ title: "请完成全部 8 项评估" });
    setSaving(true);
    const { data, error } = await supabase.from("patients").insert({ name: f.name.trim().slice(0, 20), phone: f.phone, gender: f.gender, age: ageFromBirth(f.birth), diagnosis: "待进一步评估", source: "小市社区", ad8: total, community_stage: "新接收" }).select("id").single();
    if (error || !data) { setSaving(false); return toast({ title: "建档失败", description: error?.message }); }
    const { error: e2 } = await supabase.from("scale_assessments").insert({ patient_id: data.id, scale: "ad8", items: Object.fromEntries(AD8_ITEMS.map((t, i) => [t, ans[i] ? 1 : 0])), total, assessed_by: "社区护理康复" });
    setSaving(false);
    if (e2) return toast({ title: "AD-8 保存失败", description: e2.message });
    qc.invalidateQueries();
    setCreated(data.id); setStep(2);
  };
  const footer = step === 0 ? <div className="flex justify-end gap-3"><Button variant="outline" disabled={saving} onClick={close}>取消</Button><Button variant="outline" disabled={saving} onClick={saveForAssessment}>建档，稍后评估</Button><Button className="bg-gradient-community" disabled={saving} onClick={next}>下一步</Button></div>
    : step === 1 ? <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setStep(0)}>上一步</Button><Button className="bg-gradient-community" disabled={saving} onClick={submit}>{saving ? "提交中…" : "提交并建档"}</Button></div>
    : <div className="flex justify-end gap-3"><Button variant="outline" onClick={close}>完成</Button><Button className="bg-gradient-community" onClick={() => { const id = created; close(); navigate(`/community/patients/${id}`); }}>查看档案</Button></div>;
  return <ActionSheet open={open} onOpenChange={v => !v && !saving && close()} title="新增患者并初筛" footer={footer}>
    <div className="mb-5 flex items-center justify-center gap-3 text-sm">{STEPS.map((s, i) => <div key={s} className="flex items-center gap-3">
      {i > 0 && <span className="h-px w-16 bg-border" />}
      <span className={cn("flex h-7 w-7 items-center justify-center rounded-full border text-sm", i <= step ? "border-success bg-success text-success-foreground" : "text-muted-foreground")}>{i < step ? <Check className="h-4 w-4" /> : i + 1}</span>
      <span className={i === step ? "font-semibold text-success" : "text-muted-foreground"}>{s}</span></div>)}</div>
    {step === 0 && <div className="mx-auto max-w-xl space-y-4 text-sm">
      {([["姓名", "name", "请输入患者姓名"], ["手机号", "phone", "请输入手机号码"]] as const).map(([l, k, ph]) => <label key={k} className="grid grid-cols-[100px_1fr] items-center"><span><span className="text-destructive">* </span>{l}</span><Input value={f[k]} placeholder={ph} maxLength={k === "phone" ? 11 : 20} onChange={e => setF({ ...f, [k]: e.target.value })} /></label>)}
      <div className="grid grid-cols-[100px_1fr] items-center"><span>性别</span><div className="flex gap-6">{["男", "女"].map(g => <label key={g} className="flex items-center gap-1.5"><input type="radio" name="gender" checked={f.gender === g} onChange={() => setF({ ...f, gender: g })} />{g}</label>)}</div></div>
      <label className="grid grid-cols-[100px_1fr] items-center"><span><span className="text-destructive">* </span>出生日期</span><Input type="date" value={f.birth} max={new Date().toLocaleDateString("en-CA")} onChange={e => setF({ ...f, birth: e.target.value })} /></label>
      <label className="grid grid-cols-[100px_1fr] items-center"><span>居住社区</span><select className="h-10 rounded-md border bg-background px-3" value={f.community} onChange={e => setF({ ...f, community: e.target.value })}><option>小市社区</option></select></label>
    </div>}
    {step === 1 && <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
      <div><p className="font-semibold">AD-8 认知功能初筛量表 <span className="ml-2 text-xs font-normal text-muted-foreground">共 8 项</span></p><p className="mb-2 mt-1 text-sm text-muted-foreground">与以往相比，近几年内是否出现以下变化？</p>
        <div className="divide-y rounded-lg border text-sm">{AD8_ITEMS.map((t, i) => <div key={t} className="flex items-center gap-3 px-3 py-2"><span className="flex-1">{i + 1}. {t}</span>{([[true, "是"], [false, "否"]] as const).map(([v, l]) => <label key={l} className="flex items-center gap-1"><input type="radio" name={`ad8-${i}`} checked={ans[i] === v} onChange={() => setAns(ans.map((x, j) => (j === i ? v : x)))} />{l}</label>)}</div>)}</div>
        <p className="mt-2 text-sm">当前得分：<b className={total >= 2 ? "text-warning" : "text-success"}>{total}</b> / 8</p></div>
      <div className="h-fit rounded-lg bg-success/10 p-3 text-xs leading-relaxed"><p className="mb-2 flex items-center gap-1 font-semibold"><Info className="h-4 w-4 text-success" />AD-8 说明</p><p>AD-8 是一种简便的认知功能初筛问卷，共 8 个条目，家属或照护者协助作答。</p><p className="mt-2">评分：答“是”计 1 分，总分 0–8 分。</p><p className="mt-2">判定：≥2 分提示认知异常风险，建议进一步评估（如 MMSE、MoCA）。</p></div>
    </div>}
    {step === 2 && <div className="py-6 text-center"><div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground"><Check className="h-8 w-8" /></div>
      <p className="text-lg font-semibold">{f.name} 已建档</p>{deferred ? <p className="mt-2 text-sm">待 AD-8 初筛评估</p> : <p className="mt-2 text-sm">AD-8 初筛 <b>{total}</b> 分 · <span className={total >= 2 ? "text-warning" : "text-success"}>{total >= 2 ? "筛查阳性" : "筛查阴性"}</span></p>}
      <p className="mt-1 text-sm text-muted-foreground">{deferred ? "已加入待评估患者列表。" : total >= 2 ? "建议安排 MMSE / MoCA 进一步评估，初筛结果不作为诊断。" : "建议健康宣教，每年复筛。"}</p></div>}
  </ActionSheet>;
}
