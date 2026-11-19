import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScaleAssessments } from "@/data/patients";
import { SCALES } from "@/data/scales";
import { latestSelfAssessments } from "../../../supabase/functions/_shared/selfAssessment";
import ScaleDetailSheet from "./ScaleDetailSheet";

/** 方案生成前置条件：医生他评量表 + 患者自评量表的填写情况。 */
export default function PlanPrerequisites({ patientId }: { patientId: string }) {
  const navigate = useNavigate();
  const { data: records = [] } = useScaleAssessments(patientId);
  const [scale, setScale] = useState<string | null>(null);
  const latest = (key: string) => records.filter(r => r.scale === key).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const selfs = latestSelfAssessments(records);
  const doneCount = SCALES.filter(s => latest(s.key)).length + selfs.filter(s => s.record).length;
  const Row = ({ name, record, onOpen }: { name: string; record?: { total: number; created_at: string; assessed_by: string | null } | null; onOpen: () => void }) =>
    <div className="flex items-center justify-between gap-2 border-b py-2 last:border-0">
      <div className="min-w-0"><p className="text-xs font-medium">{name} · {record ? `${record.total} 分` : "未填写"}</p>
        <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[14px] ${record ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{record ? "已填写" : "待填写"}</span>
        {record && <span className="ml-1 text-[14px] text-muted-foreground">{new Date(record.created_at).toLocaleDateString("zh-CN")} · {record.assessed_by}</span>}</div>
      <Button size="sm" variant="ghost" className="shrink-0 text-primary" onClick={onOpen}>{record ? "详情" : "协助完成"}</Button>
    </div>;
  return <Card className="p-4 shadow-soft">
    <div className="mb-1 flex items-center justify-between"><p className="text-sm font-semibold">方案生成前置条件</p><span className="text-[15.4px] text-muted-foreground">已完成 {doneCount}/{SCALES.length + selfs.length}</span></div>
    <p className="mb-1 mt-2 text-xs font-medium text-primary">医生他评量表</p>
    {SCALES.map(s => <Row key={s.key} name={s.name} record={latest(s.key)} onOpen={() => latest(s.key) ? setScale(s.key) : navigate(`/doctor/assess/${patientId}`)} />)}
    <p className="mb-1 mt-3 text-xs font-medium text-primary">患者自评量表</p>
    {selfs.map(({ questionnaire: q, record }) => <Row key={q.id} name={q.name} record={record} onOpen={() => navigate(`/doctor/self-assess/${patientId}?scale=${q.id}`)} />)}
    <ScaleDetailSheet patientId={patientId} scale={scale} onClose={() => setScale(null)} />
  </Card>;
}
