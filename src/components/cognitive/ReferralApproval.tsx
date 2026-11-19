import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ActionSheet from "@/components/nurse/ActionSheet";
import { DIAG_DEPTS, DEPT_DOCTORS } from "@/data/cognitive";
import type { Referral } from "@/data/patients";
import { reviewUpwardReferral } from "@/data/referralApproval";
import { toast } from "@/hooks/use-toast";

export default function ReferralApproval({ referral }: { referral: Referral }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [dept, setDept] = useState(referral.dept ?? DIAG_DEPTS[0]);
  const [doctor, setDoctor] = useState(referral.doctor_name ?? DEPT_DOCTORS[DIAG_DEPTS[0]][0]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async (approve: boolean) => {
    if (!note.trim()) return toast({ title: "请填写审批意见" });
    setSaving(true);
    try {
      await reviewUpwardReferral(referral.id, approve, note, dept, doctor);
      await qc.invalidateQueries({ queryKey: ["referrals"] });
      setOpen(false);
      toast({ title: approve ? "审批通过，已转出至上级医院" : "申请已退回社区", description: "社区端转诊状态已同步" });
    } catch (e) {
      toast({ title: "审批失败", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally { setSaving(false); }
  };
  return <>
    <Card className="border-warning/40 bg-warning/5 p-3">
      <p className="text-sm font-semibold">转诊申请待审批 · {referral.from_hospital}</p>
      <p className="mt-1 break-words text-xs text-muted-foreground">{referral.reason}</p>
      <p className="mt-1 text-xs text-muted-foreground">申请转至：{referral.to_community} · {referral.dept} · {referral.doctor_name}</p>
      <Button size="sm" className="mt-2 w-full" onClick={() => setOpen(true)}>审批转诊</Button>
    </Card>
    <ActionSheet open={open} onOpenChange={setOpen} title="转诊审批" description="转出至南京市鼓楼医院"
      footer={<div className="flex gap-2"><Button className="flex-1" variant="outline" disabled={saving} onClick={() => save(false)}>退回申请</Button><Button className="flex-1" disabled={saving} onClick={() => save(true)}>批准并转出</Button></div>}>
      <div className="space-y-3">
        <p className="text-xs">{referral.reason}</p>
        <p className="text-sm font-medium">上级医院门诊</p>
        <div className="grid grid-cols-3 gap-1">{DIAG_DEPTS.map(d => <Button key={d} size="sm" variant={dept === d ? "default" : "outline"} className="px-1 text-xs" onClick={() => { setDept(d); setDoctor(DEPT_DOCTORS[d][0]); }}>{d}</Button>)}</div>
        <p className="text-sm font-medium">指定医生</p>
        <div className="space-y-1">{(DEPT_DOCTORS[dept as keyof typeof DEPT_DOCTORS] ?? []).map(d => <Button key={d} variant={doctor === d ? "default" : "outline"} className="w-full justify-start whitespace-normal text-xs" onClick={() => setDoctor(d)}>{d}</Button>)}</div>
        <label className="block text-sm">审批意见<Textarea className="mt-1" rows={4} maxLength={1000} value={note} onChange={e => setNote(e.target.value)} placeholder="填写转诊意见或退回原因" /></label>
      </div>
    </ActionSheet>
  </>;
}