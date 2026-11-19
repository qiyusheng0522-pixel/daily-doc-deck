import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronRight, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScaleAssessments } from "@/data/patients";
import { latestSelfAssessments } from "../../../supabase/functions/_shared/selfAssessment";
import { selfRiskLabel } from "@/data/selfRisk";
import ScaleDetailSheet from "./ScaleDetailSheet";
import { cn } from "@/lib/utils";

const TONE = { ok: "bg-success/15 text-success", warn: "bg-warning/15 text-warning", high: "bg-destructive/15 text-destructive" };

export default function SelfAssessmentResults({ patientId, assist = false }: { patientId: string; readOnly?: boolean; assist?: boolean }) {
  const { data: records = [], isLoading, isError } = useScaleAssessments(patientId);
  const navigate = useNavigate();
  const [scale, setScale] = useState<string | null>(null);
  return <Card className="p-4 shadow-soft">
    <p className="mb-2 flex items-center gap-1.5 text-base font-semibold"><ClipboardList className="h-4 w-4 text-primary" />患者自评量表结果</p>
    {isLoading ? <p className="text-sm text-muted-foreground">读取中…</p> : isError ? <p className="text-sm text-destructive">自评读取失败，请重试</p> : <div className="divide-y">{latestSelfAssessments(records).map(({ questionnaire: q, record }) => {
      const risk = record ? selfRiskLabel(q.id, record.total) : null;
      return <div key={q.id} className="flex items-center gap-3 py-2.5 text-sm">
        <button type="button" disabled={!record} onClick={() => setScale(`self_${q.id}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default">
          <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{q.name}</span><span className="block text-xs text-muted-foreground">{record ? `${new Date(record.created_at).toLocaleDateString("zh-CN")} · ${record.assessed_by ?? ""}` : "未填写"}</span></span>
          {record && <span className="font-semibold">{record.total}<span className="text-xs font-normal text-muted-foreground"> 分</span></span>}
          {risk ? <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", TONE[risk.level])}>{risk.label}</span> : <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">待填写</span>}
          {record && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </button>
        {assist && <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={() => navigate(`/doctor/self-assess/${patientId}?scale=${q.id}`)}>辅助填写</Button>}
      </div>;
    })}</div>}
    <ScaleDetailSheet patientId={patientId} scale={scale} onClose={() => setScale(null)} />
  </Card>;
}
