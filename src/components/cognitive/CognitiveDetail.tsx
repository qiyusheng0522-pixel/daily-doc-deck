import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Brain, MessageSquare, Send, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import ActionSheet from "@/components/nurse/ActionSheet";
import {
  usePatient, useReferrals, usePatientEducation, useCreateReferral, useCreateUpload, type Patient,
} from "@/data/patients";
import { RISK_PLAN, TRAINING_DOMAINS, scaleLevel } from "@/data/cognitive";

type Role = "doctor" | "nurse" | "community";

const Scale = ({ label, value, max, hint }: { label: string; value: number | null; max: number; hint?: string }) => (
  <div className="rounded-lg border bg-card p-2.5">
    <p className="text-[11px] text-muted-foreground">{label}</p>
    <p className="mt-0.5 text-lg font-bold">
      {value ?? "—"}<span className="text-[11px] font-normal text-muted-foreground"> / {max}</span>
    </p>
    {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
  </div>
);

const riskTone = (r: Patient["cognitive_risk"]) =>
  r === "高风险" ? "bg-destructive/15 text-destructive" : r === "中风险" ? "bg-warning/15 text-warning" : "bg-success/15 text-success";

export default function CognitiveDetail({ role }: { role: Role }) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: p, isLoading } = usePatient(id);
  const { data: referrals = [] } = useReferrals();
  const { data: edu = [] } = usePatientEducation(id);
  const createReferral = useCreateReferral();
  const upload = useCreateUpload();
  const [sheet, setSheet] = useState<null | "up" | "down">(null);
  const [note, setNote] = useState("");

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">加载中…</p>;
  if (!p) return <p className="p-6 text-sm text-muted-foreground">未找到该患者档案</p>;

  const plan = p.cognitive_risk ? RISK_PLAN[p.cognitive_risk] : null;
  const myRefs = referrals.filter((r) => r.patient_id === p.id);

  const submit = () => {
    const direction = sheet === "up" ? "上转" : "下转";
    const reason = note.trim() || (direction === "上转"
      ? `AD-8 ${p.ad8 ?? "-"}，MMSE ${p.mmse ?? "-"}，MoCA ${p.moca ?? "-"}，疑似认知障碍，申请记忆门诊确诊`
      : `确诊${p.cognitive_diagnosis ?? ""}，回小市社区训练站接续认知训练`);
    createReferral.mutate(
      { patientId: p.id, reason, direction, doctorName: role === "doctor" ? "记忆门诊" : "训练站评估师" },
      {
        onSuccess: () => {
          toast({ title: direction === "上转" ? "上转单已推送鼓楼医院记忆门诊" : "已下转小市社区训练站",
            description: direction === "上转" ? "筛查评估后 3 个工作日内推送" : "训练站需在接诊后 5 个工作日内建档" });
          setSheet(null); setNote("");
        },
        onError: (e) => toast({ title: "提交失败", description: String(e) }),
      },
    );
  };

  return (
    <div className="bg-muted/30 min-h-full">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-accent">
          <ArrowLeft className="h-4 w-4" /><span className="text-sm">返回</span>
        </button>
        <h2 className="text-base font-semibold">{p.name}</h2>
        <span className="w-10" />
      </div>

      <div className="space-y-3 p-3">
        <Card className="p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-xl font-bold text-accent">{p.name[0]}</div>
            <div className="flex-1">
              <p className="font-bold">{p.name} <span className="text-xs font-normal text-muted-foreground">{p.gender} · {p.age}岁</span></p>
              <p className="text-xs text-muted-foreground">{p.cognitive_diagnosis ?? "待评估"}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">来源：{p.source} · 照护者：{p.caregiver ?? "未登记"}</p>
            </div>
            {p.cognitive_risk && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${riskTone(p.cognitive_risk)}`}>{p.cognitive_risk}</span>}
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(role === "doctor" ? `/doctor/chat/${p.id}` : `/${role}/chat/patient/${p.id}`)}>
              <MessageSquare className="mr-1 h-4 w-4" />沟通
            </Button>
            {role !== "doctor" && (
              <Button size="sm" className="flex-1" onClick={() => setSheet("up")}><Send className="mr-1 h-4 w-4" />开上转单</Button>
            )}
            {role === "doctor" && (
              <Button size="sm" className="flex-1" onClick={() => setSheet("down")}><Send className="mr-1 h-4 w-4" />确诊并下转</Button>
            )}
            {role === "community" && (
              <Button size="sm" variant="secondary" className="flex-1" disabled={upload.isPending}
                onClick={() => upload.mutate({ patientId: p.id, note: "认知量表与训练记录" }, {
                  onSuccess: () => toast({ title: "已上传至鼓楼医院", description: "可引导家属通过鼓楼医院互联网医院复诊" }),
                })}>上传鼓楼</Button>
            )}
          </div>
        </Card>

        <Card className="p-4 shadow-soft">
          <p className="mb-2 flex items-center gap-1 text-sm font-semibold"><Brain className="h-4 w-4 text-accent" />认知评估</p>
          <div className="grid grid-cols-3 gap-2">
            <Scale label="AD-8 初筛" value={p.ad8} max={8} hint={p.ad8 != null ? (p.ad8 >= 2 ? "阳性 ≥2" : "阴性") : undefined} />
            <Scale label="MMSE" value={p.mmse} max={30} hint={scaleLevel("mmse", p.mmse)} />
            <Scale label="MoCA" value={p.moca} max={30} hint={scaleLevel("moca", p.moca)} />
            <Scale label="SCD-Q9" value={p.scd_q9} max={9} />
            <Scale label="ADL(Barthel)" value={p.adl} max={100} hint={scaleLevel("adl", p.adl)} />
            <div className="rounded-lg border bg-card p-2.5">
              <p className="text-[11px] text-muted-foreground">下次复评</p>
              <p className="mt-1 text-sm font-semibold">{p.next_reassess ?? "—"}</p>
            </div>
          </div>
          {(p.risk_tags.length > 0 || p.lifestyle_warnings.length > 0) && (
            <div className="mt-3">
              <p className="mb-1 text-[11px] text-muted-foreground">可改变危险因素</p>
              <div className="flex flex-wrap gap-1">
                {[...p.risk_tags, ...p.lifestyle_warnings].map((t) => (
                  <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{t}</span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {plan && (
          <Card className="p-4 shadow-soft">
            <p className="text-sm font-semibold">分级干预方案 · {p.cognitive_risk}</p>
            <p className="text-[11px] text-muted-foreground">{plan.group} · 复评{plan.reassess}</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">{plan.actions.map((a) => <li key={a}>{a}</li>)}</ul>
            {p.cognitive_risk !== "低风险" && (
              <>
                <p className="mt-3 text-[11px] text-muted-foreground">认知训练八大领域</p>
                <div className="mt-1 grid grid-cols-4 gap-1">
                  {TRAINING_DOMAINS.map((d) => <span key={d} className="rounded bg-accent/10 px-1 py-1 text-center text-[11px] text-accent">{d}</span>)}
                </div>
              </>
            )}
          </Card>
        )}

        <Card className="p-4 shadow-soft">
          <p className="mb-2 text-sm font-semibold">双向转诊记录</p>
          {myRefs.length === 0 ? <p className="text-xs text-muted-foreground">暂无转诊</p> : myRefs.map((r) => (
            <div key={r.id} className="mb-2 rounded-lg border p-2 text-xs">
              <p className="font-medium">{r.direction} · {r.from_hospital} → {r.to_community} <span className="text-muted-foreground">({r.status})</span></p>
              <p className="text-muted-foreground">{r.reason}</p>
            </div>
          ))}
        </Card>

        <Card className="p-4 shadow-soft">
          <p className="mb-2 text-sm font-semibold">已推送宣教</p>
          {edu.length === 0 ? <p className="text-xs text-muted-foreground">暂无</p> : edu.map((e) => (
            <div key={e.id} className="flex justify-between border-b py-1.5 text-xs last:border-0">
              <span>{e.education_items?.title}</span><span className="text-muted-foreground">{e.status}</span>
            </div>
          ))}
        </Card>

        <p className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
          <AlertTriangle className="h-3 w-3" />出现急性意识障碍或卒中样症状，立即启动急救。
        </p>
      </div>

      <ActionSheet open={!!sheet} onOpenChange={(o) => !o && setSheet(null)}
        title={sheet === "up" ? "开具上转单 · 鼓楼医院记忆门诊" : "确诊下转 · 小市社区训练站"}
        description={sheet === "up" ? "疑似认知障碍，筛查评估后 3 个工作日内推送" : "填写诊疗建议，训练站接诊后 5 个工作日内建档"}
        footer={<Button className="w-full" disabled={createReferral.isPending} onClick={submit}>确认提交</Button>}>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
          placeholder={sheet === "up" ? "转诊原因（留空将自动带入量表分数）" : "诊疗建议，如：多奈哌齐 5mg 睡前；每周 2 次小组认知训练"} />
      </ActionSheet>
    </div>
  );
}
