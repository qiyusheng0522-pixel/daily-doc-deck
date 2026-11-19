import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Brain, Send, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import ActionSheet from "@/components/nurse/ActionSheet";
import { planConfirmed, needsReferral, COMMUNITY_STATIONS, DIAG_DEPTS, DEPT_DOCTORS, AD8_ITEMS } from "@/data/cognitive";
import PlanReview from "@/components/cognitive/PlanReview";
import SelfAssessmentResults from "@/components/cognitive/SelfAssessmentResults";
import { Camera } from "lucide-react";
import type { Advice } from "@/components/cognitive/AiAdvicePanel";
import {
  usePatient, usePatientDocuments, useReferrals, usePatientEducation, useTrainingRecords, useCreateReferral, type Patient,
} from "@/data/patients";
import { RISK_PLAN, scaleLevel, suggestRisk } from "@/data/cognitive";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const [sheet, setSheet] = useState<null | "up" | "down">(null);
  const [note, setNote] = useState("");
  const qc = useQueryClient();
  const [grade, setGrade] = useState<null | { risk: "低风险" | "中风险" | "高风险"; refer: boolean; plan: string }>(null);
  const [saving, setSaving] = useState(false);
  const { data: trainings = [] } = useTrainingRecords(id);
  const { data: docs = [] } = usePatientDocuments(id);
  const [upDept, setUpDept] = useState<(typeof DIAG_DEPTS)[number]>(DIAG_DEPTS[0]);
  const [upDoc, setUpDoc] = useState<string>(DEPT_DOCTORS[DIAG_DEPTS[0]][0]);
  const [station, setStation] = useState<string>(COMMUNITY_STATIONS[0]);
  const [uploading, setUploading] = useState(false);
  const [task, setTask] = useState<null | { domain: string; activity: string; setting: string; date: string; duration: string; completion: string; freq?: string }>(null);
  const [docsOpen, setDocsOpen] = useState(false);
  const [ad8, setAd8] = useState<null | boolean[]>(null);
  const [accept, setAccept] = useState<null | { rid: string; dept: string; diag: string; feedback: string }>(null);
  const [fu, setFu] = useState<null | { item: string; note: string }>(null);
  const [edit, setEdit] = useState<null | { kind: "profile" | "assess"; v: Record<string, string> }>(null);

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">加载中…</p>;
  if (!p) return <p className="p-6 text-sm text-muted-foreground">未找到该患者档案</p>;

  const aiRisk = suggestRisk(p);
  const confirmGrade = async () => {
    if (!grade) return;
    setSaving(true);
    const { error } = await supabase.from("patients").update({
      cognitive_risk: grade.risk, next_reassess: RISK_PLAN[grade.risk].reassess,
    }).eq("id", p.id);
    if (!error && grade.refer) {
      await createReferral.mutateAsync({ patientId: p.id, direction: "下转", doctorName: "评估医生",
        reason: `确认${grade.risk}，转社区护理康复承接。方案：${grade.plan || RISK_PLAN[grade.risk].actions.join("；")}` });
    }
    setSaving(false);
    if (error) return toast({ title: "保存失败", description: error.message });
    qc.invalidateQueries({ queryKey: ["patient", p.id] }); qc.invalidateQueries({ queryKey: ["patients"] });
    toast({ title: `已确认为${grade.risk}`, description: grade.refer ? "已转社区护理康复承接" : `复评周期：${RISK_PLAN[grade.risk].reassess}` });
    setGrade(null);
  };
  const PROFILE_F = [["name", "姓名"], ["gender", "性别"], ["age", "年龄"], ["phone", "电话"], ["caregiver", "照护者"], ["id_no", "身份证号"]] as const;
  const ASSESS_F = [["ad8", "AD-8 (0-8)"], ["mmse", "MMSE (0-30)"], ["moca", "MoCA (0-30)"], ["scd_q9", "SCD-Q9 (0-9)"], ["adl", "ADL (0-100)"], ["cognitive_diagnosis", "认知诊断"]] as const;
  const NUM = ["age", "ad8", "mmse", "moca", "scd_q9", "adl"];
  const openEdit = (kind: "profile" | "assess") => {
    const f: readonly (readonly [string, string])[] = kind === "profile" ? PROFILE_F : ASSESS_F;
    setEdit({ kind, v: Object.fromEntries(f.map(([k]) => [k, String((p as Record<string, unknown>)[k] ?? "")])) });
  };
  const saveEdit = async () => {
    if (!edit) return;
    const patch: Record<string, string | number | null> = {};
    for (const [k, v] of Object.entries(edit.v)) patch[k] = NUM.includes(k) ? (v === "" ? null : Number(v)) : (v.trim() || null);
    if (patch.name === null) return toast({ title: "姓名不能为空" });
    setSaving(true);
    const { error } = await supabase.from("patients").update(patch as never).eq("id", p.id);
    setSaving(false);
    if (error) return toast({ title: "保存失败", description: error.message });
    qc.invalidateQueries({ queryKey: ["patient", p.id] }); qc.invalidateQueries({ queryKey: ["patients"] });
    setEdit(null); toast({ title: edit.kind === "profile" ? "档案已保存" : "评估结果已更新" });
  };
  const uploadDocs = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) { toast({ title: `${file.name} 超过 10MB` }); continue; }
      const path = `${p.id}/${Date.now()}-${file.name.replace(/[^\w.]/g, "_")}`;
      const { error } = await supabase.storage.from("patient-docs").upload(path, file);
      if (error) { toast({ title: "上传失败", description: error.message }); continue; }
      await supabase.from("patient_documents").insert({ patient_id: p.id, path, kind: "检查检验", uploaded_by: role === "doctor" ? "评估医生" : "社区护理康复" });
    }
    setUploading(false);
    qc.invalidateQueries({ queryKey: ["patient-docs", p.id] });
    toast({ title: "建档材料已上传" });
  };
  const refresh = () => { qc.invalidateQueries({ queryKey: ["training-records", p.id] }); qc.invalidateQueries({ queryKey: ["followups"] }); };
  const saveTask = async () => {
    if (!task) return;
    setSaving(true);
    const { error } = await supabase.from("training_records").insert({ patient_id: p.id, trained_on: task.date, domain: task.domain,
      activity: task.activity.slice(0, 200), setting: task.setting, duration_min: Number(task.duration) || 30, completion: task.completion, operator: "社区护理康复" });
    setSaving(false);
    if (error) return toast({ title: "安排失败", description: error.message });
    refresh(); setTask(null);
    toast({ title: task.completion === "待执行" ? (task.setting === "家庭任务" ? "家庭任务已发放" : "训练已安排") : `已记录执行：${task.completion}`, description: "按医生确认的训练方案执行" });
  };
  const markExec = async (rid: string, completion: string) => {
    const { error } = await supabase.from("training_records").update({ completion }).eq("id", rid);
    if (error) return toast({ title: "记录失败", description: error.message });
    refresh(); toast({ title: `已记录：${completion}` });
  };
  const saveFu = async () => {
    if (!fu || !fu.item.trim()) return toast({ title: "请填写随访内容" });
    setSaving(true);
    const { error } = await supabase.from("followups").insert({ patient_id: p.id, status: "已完成", item: fu.item.trim().slice(0, 100), note: fu.note.trim().slice(0, 500) || null });
    setSaving(false);
    if (error) return toast({ title: "保存失败", description: error.message });
    refresh(); setFu(null); toast({ title: "随访已记录" });
  };
  const saveAd8 = async () => {
    if (!ad8) return;
    const total = ad8.filter(Boolean).length;
    setSaving(true);
    await supabase.from("scale_assessments").insert({ patient_id: p.id, scale: "ad8", items: Object.fromEntries(AD8_ITEMS.map((t, i) => [t, ad8[i] ? 1 : 0])), total, assessed_by: "社区护理康复" });
    const { error } = await supabase.from("patients").update({ ad8: total }).eq("id", p.id);
    setSaving(false);
    if (error) return toast({ title: "保存失败", description: error.message });
    qc.invalidateQueries({ queryKey: ["patient", p.id] }); qc.invalidateQueries({ queryKey: ["patients"] }); setAd8(null);
    toast({ title: `AD-8 初筛 ${total} 分`, description: total >= 2 ? "阳性：建议进一步 MMSE/MoCA 评估，中高风险开具上转单" : "阴性：健康宣教，每年复评" });
  };
  const buildFile = async () => {
    const { error } = await supabase.from("patients").update({ community_stage: "干预中" }).eq("id", p.id);
    if (error) return toast({ title: "建档失败", description: error.message });
    qc.invalidateQueries({ queryKey: ["patient", p.id] }); qc.invalidateQueries({ queryKey: ["patients"] });
    toast({ title: "已建档，进入干预管理", description: "按分级干预方案安排训练与随访" });
  };
  const saveAccept = async () => {
    if (!accept || !accept.feedback.trim()) return toast({ title: "请填写指导意见" });
    setSaving(true);
    const { error } = await supabase.from("referrals").update({ status: "已接收", received_at: new Date().toISOString(), dept: accept.dept, feedback: accept.feedback.trim().slice(0, 1000) }).eq("id", accept.rid);
    if (!error && accept.diag.trim()) await supabase.from("patients").update({ cognitive_diagnosis: accept.diag.trim().slice(0, 60), refer_dept: accept.dept }).eq("id", p.id);
    setSaving(false);
    if (error) return toast({ title: "提交失败", description: error.message });
    qc.invalidateQueries(); setAccept(null);
    toast({ title: "已接诊确认", description: "指导意见已反馈至社区训练站" });
  };
  const myRefs = referrals.filter((r) => r.patient_id === p.id);
  const pendingUp = myRefs.find((r) => r.direction === "上转" && r.status === "待接收");

  const submit = () => {
    const direction = sheet === "up" ? "上转" : "下转";
    const reason = note.trim() || (direction === "上转"
      ? `AD-8 ${p.ad8 ?? "-"}，MMSE ${p.mmse ?? "-"}，MoCA ${p.moca ?? "-"}，疑似认知障碍，申请记忆门诊确诊`
      : `确诊${p.cognitive_diagnosis ?? ""}，回${station}接续认知训练`);
    createReferral.mutate(
      { patientId: p.id, reason, direction, toCommunity: direction === "下转" ? station : undefined, dept: direction === "上转" ? upDept : undefined, doctorName: direction === "上转" ? upDoc : "记忆门诊" },
      {
        onSuccess: () => {
          toast({ title: direction === "上转" ? `已上传至鼓楼医院${upDept} · ${upDoc}` : `已下转${station}`,
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
              <p className="mt-1 flex flex-wrap gap-1 text-[10px]"><span className="rounded bg-success/10 px-1.5 py-0.5 text-success">已关联电子健康档案</span><span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">卫生健康云</span></p>
            </div>
            {p.cognitive_risk && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${riskTone(p.cognitive_risk)}`}>{p.cognitive_risk}</span>}
          </div>
          <div className="mt-3 flex gap-2">
            {role === "community" && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setDocsOpen(true)}><Camera className="mr-1 h-4 w-4" />上传档案</Button>
            )}
            {role !== "doctor" && needsReferral(p.cognitive_risk) && (
              <Button size="sm" className="flex-1" onClick={() => setSheet("up")}><Send className="mr-1 h-4 w-4" />患者上传</Button>
            )}
            {role === "doctor" && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setDocsOpen(true)}><Camera className="mr-1 h-4 w-4" />录入档案</Button>
            )}
            {role === "doctor" && (
              <Button size="sm" className="flex-1" onClick={() => setSheet("down")}><Send className="mr-1 h-4 w-4" />转诊</Button>
            )}
          </div>
        </Card>

        {role === "doctor" && pendingUp && (
          <Card className="border-warning/40 bg-warning/5 p-3 shadow-soft">
            <p className="text-sm font-semibold">上转待接诊 · 来自{pendingUp.from_hospital}</p>
            <p className="mt-1 text-xs text-muted-foreground">{pendingUp.reason}</p>
            <Button size="sm" className="mt-2 w-full" onClick={() => setAccept({ rid: pendingUp.id, dept: pendingUp.dept ?? DIAG_DEPTS[0], diag: p.cognitive_diagnosis ?? "", feedback: "" })}>确认接收患者</Button>
          </Card>
        )}
        {role === "community" && (planConfirmed(p) ? (
          <Card className="p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">医生训练方案 · 按方案执行</p>
              {p.ai_plan_confirmed_at && <span className="text-[11px] text-success">✓ 医生已确认 {new Date(p.ai_plan_confirmed_at).toLocaleDateString("zh-CN")}</span>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{(p.ai_plan as Advice).summary}</p>
            <ul className="mt-2 space-y-1.5">
              {(p.ai_plan as Advice).training.map((t, i) => {
                const setting = t.setting === "家庭作业" ? "家庭任务" : t.setting;
                const open = (completion: string) => setTask({ domain: t.domain, activity: t.activity, setting, freq: `${t.frequency} · ${t.duration}`,
                  date: new Date().toISOString().slice(0, 10), duration: String(parseInt(t.duration.replace(/\D*(\d+).*/, "$1")) || 20), completion });
                return (
                  <li key={i} className="rounded-lg border p-2.5 text-xs">
                    <div className="flex items-center justify-between"><span className="font-medium">{t.domain}</span><span className="text-[11px] text-muted-foreground">{setting}</span></div>
                    <p className="mt-0.5">{t.activity}</p>
                    <p className="text-[11px] text-muted-foreground">{t.frequency} · {t.duration}</p>
                    <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => open("待执行")}>{setting === "家庭任务" ? "发放家庭任务" : "安排训练"}</Button>
                      <Button size="sm" className="h-7 text-xs" onClick={() => open("完成")}>记录执行</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        ) : <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">训练方案待评估医生确认，确认后在此按方案安排训练并记录执行。</div>)}
        {role === "community" && (
          <Card className="p-3 shadow-soft">
            <p className="mb-2 text-sm font-semibold">训练站工作</p>
            <div className="mb-2 grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => setAd8(AD8_ITEMS.map(() => false))}>AD-8 初筛评估</Button>
              {p.community_stage === "新接收"
                ? <Button size="sm" onClick={buildFile}>干预建档</Button>
                : <Button size="sm" variant="outline" disabled>{p.community_stage === "干预中" ? "干预管理中" : "已建档"}</Button>}
            </div>
            <Button size="sm" className="w-full" onClick={() => setFu({ item: "月度电话随访", note: "" })}>记录随访</Button>
            <p className="mt-2 text-[11px] text-muted-foreground">认知训练按上方医生方案逐项安排、记录执行；已安排的在"认知训练记录"中登记完成情况。</p>
          </Card>
        )}
        {role === "community" && !needsReferral(p.cognitive_risk) && p.cognitive_risk && <p className="px-1 text-[11px] text-muted-foreground">低风险无需转诊：与家庭医生联合制定随访评估计划并开展健康宣教。</p>}

        <Card className="p-4 shadow-soft">
          <div className="mb-2 flex items-center justify-between"><p className="flex items-center gap-1 text-sm font-semibold"><Brain className="h-4 w-4 text-accent" />认知风险评估</p>{role === "doctor" && <span className="flex gap-1"><Button size="sm" className="h-7 text-xs" onClick={() => navigate(`/doctor/assess/${p.id}`)}>量表评估</Button><Button size="sm" variant="ghost" className="h-7 text-xs text-primary" onClick={() => openEdit("assess")}>编辑</Button></span>}</div>
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
          <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/5 p-2.5">
            <div className="text-xs">
              <p className="text-muted-foreground">{p.ai_risk ? "模型分析风险等级" : "智能体初步风险等级"}</p>
              <p className="font-semibold">{(() => { const r = p.cognitive_risk ?? (p.ai_risk as { risk?: string } | null)?.risk ?? aiRisk; return r ? <span className={`rounded-full px-2 py-0.5 text-xs ${riskTone(r as Patient["cognitive_risk"])}`}>{r}</span> : "量表不足，暂无"; })()}</p>
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

        {role === "doctor" && <SelfAssessmentResults patientId={p.id} />}

        {docs.length > 0 && <Card className="p-4 shadow-soft">
          <p className="mb-2 text-sm font-semibold">建档材料 <span className="text-xs font-normal text-muted-foreground">({docs.length})</span></p>
          <div className="grid grid-cols-4 gap-1">{docs.map((d) => d.url && <a key={d.id} href={d.url} target="_blank" rel="noreferrer"><img src={d.url} alt={d.kind} className="h-16 w-full rounded object-cover" /></a>)}</div>
        </Card>}

        <Card className="p-4 shadow-soft">
          <p className="mb-2 text-sm font-semibold">平台转诊记录</p>
          {myRefs.length === 0 ? <p className="text-xs text-muted-foreground">暂无转诊</p> : myRefs.map((r) => (
            <div key={r.id} className="mb-2 rounded-lg border p-2 text-xs">
              <p className="font-medium">{r.direction} · {r.from_hospital} → {r.to_community} <span className="text-muted-foreground">({r.status})</span></p>
              <p className="text-muted-foreground">{r.reason}</p>
              {r.feedback && <p className="mt-1 rounded bg-primary/5 p-1.5"><span className="font-medium text-primary">指导意见{r.dept ? `（${r.dept}）` : ""}：</span>{r.feedback}</p>}
            </div>
          ))}
        </Card>

        <Card className="p-4 shadow-soft">
          <p className="mb-2 text-sm font-semibold">{role === "doctor" ? "训练记录" : "认知训练记录"} <span className="text-xs font-normal text-muted-foreground">({trainings.length})</span></p>
          {trainings.length === 0 ? <p className="text-xs text-muted-foreground">暂无训练记录</p> : trainings.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-2 border-b py-1.5 text-xs last:border-0">
              <div className="min-w-0 flex-1"><p className="font-medium">{t.domain} · {t.activity}</p><p className="text-muted-foreground">{t.trained_on} · {t.setting} · {t.duration_min} 分钟{t.operator ? ` · ${t.operator}` : ""}</p></div>
              {t.completion === "待执行" && role === "community" ? (
                <span className="flex shrink-0 gap-1">{["完成", "部分完成", "未完成"].map((c) => (
                  <button key={c} onClick={() => markExec(t.id, c)} className="rounded border px-1.5 py-0.5 text-[11px] text-primary">{c}</button>))}</span>
              ) : <span className={`shrink-0 whitespace-nowrap ${t.completion === "完成" ? "text-success" : t.completion === "待执行" ? "text-primary" : "text-warning"}`}>{t.completion}</span>}
            </div>
          ))}
        </Card>

        {role === "doctor" && <PlanReview p={p} historyOnly />}

        {role !== "doctor" && <Card className="p-4 shadow-soft">
          <p className="mb-2 text-sm font-semibold">已推送宣教</p>
          {edu.length === 0 ? <p className="text-xs text-muted-foreground">暂无</p> : edu.map((e) => (
            <div key={e.id} className="flex justify-between border-b py-1.5 text-xs last:border-0">
              <span>{e.education_items?.title}</span><span className="text-muted-foreground">{e.status}</span>
            </div>
          ))}
        </Card>}

        <p className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
          <AlertTriangle className="h-3 w-3" />出现急性意识障碍或卒中样症状，立即启动急救。
        </p>
      </div>

      <ActionSheet open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit?.kind === "profile" ? "录入患者档案" : "编辑认知风险评估"}
        footer={<Button className="w-full" disabled={saving} onClick={saveEdit}>保存</Button>}>
        {edit && (
          <div className="grid grid-cols-2 gap-2">
            {(edit.kind === "profile" ? PROFILE_F as readonly (readonly [string, string])[] : ASSESS_F).map(([k, label]) => (
              <label key={k} className={`text-xs ${k === "cognitive_diagnosis" || k === "id_no" ? "col-span-2" : ""}`}>{label}
                <Input className="mt-1" type={NUM.includes(k) ? "number" : "text"} value={edit.v[k]} maxLength={60}
                  onChange={(e) => setEdit({ ...edit, v: { ...edit.v, [k]: e.target.value } })} />
              </label>
            ))}
          </div>
        )}
      </ActionSheet>

      <ActionSheet open={!!task} onOpenChange={(o) => !o && setTask(null)} title={task?.completion === "待执行" ? (task?.setting === "家庭任务" ? "发放家庭任务" : "安排训练") : "记录执行"}
        description="按医生确认的训练方案执行"
        footer={<Button className="w-full" disabled={saving} onClick={saveTask}>确认</Button>}>
        {task && (
          <div className="space-y-3">
            <div className="rounded-lg bg-primary/5 p-2.5 text-xs">
              <p className="font-medium">{task.domain} · {task.setting}</p>
              <p className="mt-0.5">{task.activity}</p>
              {task.freq && <p className="mt-0.5 text-muted-foreground">方案要求：{task.freq}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs">{task.completion === "待执行" ? "计划日期" : "执行日期"}<Input className="mt-1" type="date" value={task.date} onChange={(e) => setTask({ ...task, date: e.target.value })} /></label>
              <label className="text-xs">时长(分钟)<Input className="mt-1" type="number" value={task.duration} onChange={(e) => setTask({ ...task, duration: e.target.value })} /></label>
            </div>
            {task.completion !== "待执行" && (
              <div className="grid grid-cols-3 gap-1">{["完成", "部分完成", "未完成"].map((c) => (
                <button key={c} onClick={() => setTask({ ...task, completion: c })} className={`rounded border py-1.5 text-xs ${task.completion === c ? "border-primary bg-primary/10 text-primary" : ""}`}>{c}</button>))}</div>
            )}
          </div>
        )}
      </ActionSheet>

      <ActionSheet open={docsOpen} onOpenChange={setDocsOpen} title={role === "doctor" ? "录入档案" : "上传档案"} description="拍照上传化验单、检查报告、体检单等，用于建档">
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed py-6 text-sm text-primary">
            <Camera className="h-5 w-5" />{uploading ? "上传中…" : "拍照 / 选择图片上传"}
            <input type="file" accept="image/*,application/pdf" capture="environment" multiple className="hidden" disabled={uploading}
              onChange={(e) => { uploadDocs(e.target.files); e.target.value = ""; }} />
          </label>
          {docs.length > 0 ? <div className="grid grid-cols-4 gap-1">{docs.map((d) => d.url && <a key={d.id} href={d.url} target="_blank" rel="noreferrer"><img src={d.url} alt={d.kind} className="h-16 w-full rounded object-cover" /></a>)}</div>
            : <p className="text-center text-xs text-muted-foreground">暂无建档材料</p>}
        </div>
      </ActionSheet>

      <ActionSheet open={!!ad8} onOpenChange={(o) => !o && setAd8(null)} title="AD-8 初筛评估" description="询问知情者，近几年是否出现以下变化（≥2 分为阳性）"
        footer={<Button className="w-full" disabled={saving} onClick={saveAd8}>保存（{ad8?.filter(Boolean).length ?? 0} 分）</Button>}>
        {ad8 && <div className="space-y-1.5">{AD8_ITEMS.map((t, i) => (
          <button key={t} onClick={() => setAd8(ad8.map((v, j) => (j === i ? !v : v)))}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs ${ad8[i] ? "border-primary bg-primary/10 text-primary" : ""}`}>
            <span>{i + 1}. {t}</span><span className="ml-2 shrink-0">{ad8[i] ? "是" : "否"}</span></button>))}</div>}
      </ActionSheet>

      <ActionSheet open={!!accept} onOpenChange={(o) => !o && setAccept(null)} title="接诊确认并反馈" description="三级医院确诊后反馈指导意见至社区训练站"
        footer={<Button className="w-full" disabled={saving} onClick={saveAccept}>确认接收</Button>}>
        {accept && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1">{DIAG_DEPTS.map((d) => (
              <button key={d} onClick={() => setAccept({ ...accept, dept: d })} className={`rounded border py-1.5 text-xs ${accept.dept === d ? "border-primary bg-primary/10 text-primary" : ""}`}>{d}</button>))}</div>
            <Input value={accept.diag} maxLength={60} onChange={(e) => setAccept({ ...accept, diag: e.target.value })} placeholder="确诊诊断，如：轻度认知障碍（MCI）" />
            <Textarea rows={4} maxLength={1000} value={accept.feedback} onChange={(e) => setAccept({ ...accept, feedback: e.target.value })} placeholder="指导意见：用药、训练重点、复评时间、需注意事项…" />
          </div>
        )}
      </ActionSheet>

      <ActionSheet open={!!fu} onOpenChange={(o) => !o && setFu(null)} title="记录随访" description="每月随访，记录老人状态与家庭训练执行情况"
        footer={<Button className="w-full" disabled={saving} onClick={saveFu}>保存</Button>}>
        {fu && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1">{["月度电话随访", "上门随访", "站内面访"].map((x) => (
              <button key={x} onClick={() => setFu({ ...fu, item: x })} className={`rounded border py-1.5 text-xs ${fu.item === x ? "border-primary bg-primary/10 text-primary" : ""}`}>{x}</button>))}</div>
            <Textarea rows={4} maxLength={500} value={fu.note} onChange={(e) => setFu({ ...fu, note: e.target.value })} placeholder="随访情况：精神睡眠、家庭任务完成度、是否有异常需上转…" />
          </div>
        )}
      </ActionSheet>

      <ActionSheet open={!!grade} onOpenChange={(o) => !o && setGrade(null)} title="确认风险分级与转诊"
        description={`智能体建议：${aiRisk ?? "—"}，请医生确认`}
        footer={<Button className="w-full" disabled={saving} onClick={confirmGrade}>确认</Button>}>
        {grade && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {(["低风险", "中风险", "高风险"] as const).map((r) => (
                <button key={r} onClick={() => setGrade({ ...grade, risk: r })}
                  className={`rounded-lg border py-2 text-sm ${grade.risk === r ? "border-primary bg-primary/10 font-medium text-primary" : ""}`}>{r}</button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">复评周期：{RISK_PLAN[grade.risk].reassess} · {RISK_PLAN[grade.risk].group}</p>
            <div className="grid grid-cols-2 gap-2">
              {[false, true].map((v) => (
                <button key={String(v)} onClick={() => setGrade({ ...grade, refer: v })}
                  className={`rounded-lg border py-2 text-sm ${grade.refer === v ? "border-primary bg-primary/10 font-medium text-primary" : ""}`}>{v ? "转社区护理康复承接" : "暂不转诊"}</button>
              ))}
            </div>
            <Textarea rows={3} value={grade.plan} onChange={(e) => setGrade({ ...grade, plan: e.target.value })} placeholder="后续方案与调整（留空按分级默认方案）" />
          </div>
        )}
      </ActionSheet>

      <ActionSheet open={!!sheet} onOpenChange={(o) => !o && setSheet(null)}
        title={sheet === "up" ? "患者上传 · 南京市鼓楼医院" : "确诊下转 · 选择承接机构"}
        description={sheet === "up" ? "疑似认知障碍，筛查评估后 3 个工作日内推送" : "填写诊疗建议，训练站接诊后 5 个工作日内建档"}
        footer={<Button className="w-full" disabled={createReferral.isPending} onClick={submit}>确认提交</Button>}>
        {sheet === "up" && (
          <div className="mb-3 space-y-2">
            <p className="text-xs text-muted-foreground">选择门诊</p>
            <div className="grid grid-cols-3 gap-1.5">
              {DIAG_DEPTS.map((d) => (
                <button key={d} onClick={() => { setUpDept(d); setUpDoc(DEPT_DOCTORS[d][0]); }}
                  className={`rounded-lg border px-2 py-2 text-xs ${upDept === d ? "border-primary bg-primary/10 font-medium text-primary" : ""}`}>{d}</button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">指定接诊医生</p>
            <div className="space-y-1.5">
              {DEPT_DOCTORS[upDept].map((d) => (
                <button key={d} onClick={() => setUpDoc(d)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${upDoc === d ? "border-primary bg-primary/10 font-medium text-primary" : ""}`}>{d}</button>
              ))}
            </div>
          </div>
        )}
        {sheet === "down" && (
          <div className="mb-3 space-y-1.5">
            {COMMUNITY_STATIONS.map((c) => (
              <button key={c} onClick={() => setStation(c)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${station === c ? "border-primary bg-primary/10 font-medium text-primary" : ""}`}>{c}</button>
            ))}
          </div>
        )}
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
          placeholder={sheet === "up" ? "转诊原因（留空将自动带入量表分数）" : "诊疗建议，如：多奈哌齐 5mg 睡前；每周 2 次小组认知训练"} />
      </ActionSheet>
    </div>
  );
}
