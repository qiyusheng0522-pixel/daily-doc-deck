import { useCurrentPatient, useNurseTasks } from "@/data/patients";
import SelfAssessmentForm from "@/components/cognitive/SelfAssessmentForm";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AD8_REQUEST } from "@/data/communityWork";
import { toast } from "@/hooks/use-toast";

export default function PatientAssessment() {
  const { data: patient, isLoading } = useCurrentPatient();
  const { data: tasks = [] } = useNurseTasks();
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const requested = tasks.some(t => t.patient_id === patient?.id && t.title === AD8_REQUEST && t.status === "待执行");
  const request = async () => {
    if (!patient || requested) return;
    setSaving(true);
    if (!patient.community_stage) {
      const { error } = await supabase.from("patients").update({ community_stage: "新接收" }).eq("id", patient.id);
      if (error) { setSaving(false); return toast({ title: "申请失败", description: error.message }); }
    }
    const { error } = await supabase.from("nurse_tasks").insert({ patient_id: patient.id, title: AD8_REQUEST, kind: "待办", status: "待执行", due_text: "家庭端申请 · 小市社区" });
    setSaving(false);
    if (error) return toast({ title: "申请失败", description: error.message });
    qc.invalidateQueries(); toast({ title: "已申请社区 AD-8 评估" });
  };
  if (isLoading) return <p className="p-4 text-sm text-muted-foreground">加载中…</p>;
  if (!patient) return <p className="p-4 text-sm text-muted-foreground">未找到患者档案</p>;
  return <div className="space-y-4 p-4">
    <section className="space-y-2 border-b pb-4"><p className="text-base font-semibold">社区认知初筛</p><p className="text-sm text-muted-foreground">{patient.name} · 小市社区</p><Button disabled={saving || requested} onClick={request}>{requested ? "已申请，待社区评估" : saving ? "提交中…" : "申请社区评估"}</Button></section>
    <SelfAssessmentForm patientId={patient.id} familyList />
  </div>;
}
