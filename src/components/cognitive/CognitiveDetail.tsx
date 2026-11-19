import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Brain, Send, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import ActionSheet from "@/components/nurse/ActionSheet";
import { planConfirmed, needsReferral, COMMUNITY_STATIONS, DIAG_DEPTS, DEPT_DOCTORS, AD8_ITEMS } from "@/data/cognitive";
import PlanReview from "@/components/cognitive/PlanReview";
import SelfAssessmentResults from "@/components/cognitive/SelfAssessmentResults";
import AssessmentHistory from "@/components/cognitive/AssessmentHistory";
import DoctorBackButton from "@/components/doctor/DoctorBackButton";
import ReferralApproval from "@/components/cognitive/ReferralApproval";
import { referralApprovalQueue, upwardReferralState } from "@/data/referralApproval";
import { communityRiskPatient, pendingCommunityReferral } from "@/data/communityReception";
import { acceptDoctorPatient, pendingDoctorReferral } from "@/data/doctorReception";
import { Camera, FileText, Cpu, HandHeart, LayoutGrid, User, Target, Layers, BarChart3, ClipboardCheck, Dumbbell, Repeat, ChevronRight, Pencil, ShieldPlus, ShieldCheck, Clock } from "lucide-react";
import ScaleDetailSheet from "@/components/cognitive/ScaleDetailSheet";
import type { Advice } from "@/components/cognitive/AiAdvicePanel";
import {
  usePatient, usePatientDocuments, useReferrals, usePatientEducation, useTrainingRecords, useCreateReferral, useReceiveReferral, type Patient,
} from "@/data/patients";
import { RISK_PLAN, suggestRisk } from "@/data/cognitive";
import { scalePresentation, type PresentedScale } from "@/data/scalePresentation";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Role = "doctor" | "nurse" | "community";

const Scale = ({ label, value, max, kind, onOpen }: { label: string; value: number | null; max: number; kind: PresentedScale; onOpen?: () => void }) => {
  const result = scalePresentation(kind, value);
  const tone = { neutral: "text-foreground", low: "text-success", medium: "text-warning", high: "text-destructive" }[result.tone];
  return <button type="button" onClick={onOpen} className="min-w-0 rounded-lg border bg-card p-2.5 text-left transition-colors hover:bg-muted/50">
    <p className="text-[15.4px] text-muted-foreground">{label}</p>
    <p className={`mt-0.5 text-lg font-bold ${tone}`}>
      {value ?? "—"}<span className="text-[15.4px] font-normal text-muted-foreground"> / {max}</span>
    </p>
    <p className={`break-words text-[14px] ${tone}`}>{result.label}</p>
  </button>;
};

const riskTone = (r: Patient["cognitive_risk"]) =>
  r === "高风险" ? "bg-destructive/15 text-destructive" : r === "中风险" ? "bg-warning/15 text-warning" : "bg-success/15 text-success";

const DURATION_OPTIONS = [10, 15, 20, 30, 45];

export default function CognitiveDetail({ role }: { role: Role }) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: p, isLoading } = usePatient(id);
  const { data: referrals = [] } = useReferrals();
  const { data: edu = [] } = usePatientEducation(id);
  const createReferral = useCreateReferral();
  const receiveReferral = useReceiveReferral();
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
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
  const [task, setTask] = useState<null | { domain: string; activity: string; setting: string; date: string; time: string; feedback: string; duration: string; completion: string; freq?: string; planIdx?: number }>(null);
  const [docsOpen, setDocsOpen] = useState(false);
  const [ad8, setAd8] = useState<null | boolean[]>(null);
  const [accept, setAccept] = useState<null | { rid: string; dept: string; diag: string; feedback: string }>(null);
  const [fu, setFu] = useState<null | { item: string; note: string }>(null);
  const [scaleOpen, setScaleOpen] = useState<string | null>(null);
  const [visitOpen, setVisitOpen] = useState(false);
  const [tab, setTab] = useState<string>("overview");
  const [edit, setEdit] = useState<null | { kind: "profile" | "assess"; v: Record<string, string> }>(null);

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">加载中…</p>;
  if (!p) return <p className="p-6 text-sm text-muted-foreground">未找到该患者档案</p>;

  const aiRisk = suggestRisk(p);
  const planItems = planConfirmed(p) ? ((p.ai_plan as Advice).training ?? []) : [];
  const presetDuration = (d: string) => { const n = parseInt(d.replace(/\D*(\d+).*/, "$1")) || 20; return [10, 15, 20, 30, 45].reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a), 20); };
  const openTask = (idx: number) => {
    const t = planItems[idx];
    if (!t) return;
    setTrainingOpen(false);
    setTask({ domain: t.domain, activity: t.activity, setting: t.setting === "家庭作业" ? "家庭任务" : t.setting, freq: `${t.frequency} · ${t.duration}`, planIdx: idx,
      date: new Date().toLocaleDateString("en-CA"), time: new Date().toTimeString().slice(0, 5), feedback: "", duration: String(presetDuration(t.duration)), completion: "完成" });
  };
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
  const PROFILE_F = [["name", "姓名"], ["gender", "性别"], ["age", "年龄"], ["phone", "电话"], ["caregiver", "照护者"], ["id_no", "身份证号"], ["past_history", "既往疾病"], ["medications", "用药情况"], ["family_history", "家族史"], ["condition_summary", "病情摘要"]] as const;
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
  const uploadDocs = async (files: FileList | null, kind = "检查检验") => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) { toast({ title: `${file.name} 超过 10MB` }); continue; }
      const path = `${p.id}/${Date.now()}-${file.name.replace(/[^\w.]/g, "_")}`;
      const { error } = await supabase.storage.from("patient-docs").upload(path, file);
      if (error) { toast({ title: "上传失败", description: error.message }); continue; }
      await supabase.from("patient_documents").insert({ patient_id: p.id, path, kind, uploaded_by: role === "doctor" ? "评估医生" : "社区护理康复" });
    }
    setUploading(false);
    qc.invalidateQueries({ queryKey: ["patient-docs", p.id] });
    toast({ title: kind === "诊疗记录" ? "诊疗记录已上传，社区端同步可见" : "建档材料已上传" });
  };
  const refresh = () => { qc.invalidateQueries({ queryKey: ["training-records"] }); qc.invalidateQueries({ queryKey: ["followups"] }); };
  const saveTask = async () => {
    if (!task) return;
    if (!planConfirmed(p)) return toast({ title: "请等待医生确认训练方案" });
    if (!task.date || !task.time || !Number.isFinite(Number(task.duration)) || Number(task.duration) <= 0) return toast({ title: "请填写训练日期、时间和有效时长" });
    setSaving(true);
    const { error } = await supabase.from("training_records").insert({ patient_id: p.id, trained_on: task.date, domain: task.domain,
      activity: task.activity, setting: task.setting, duration_min: Number(task.duration), completion: task.completion, operator: "社区护理康复", training_time: task.time, feedback: task.feedback.trim() || null });
    setSaving(false);
    if (error) return toast({ title: "安排失败", description: error.message });
    refresh(); setTask(null);
    toast({ title: "训练记录已保存", description: "按医生确认的训练方案执行" });
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
    try {
      await acceptDoctorPatient(accept.rid, { dept: accept.dept, feedback: accept.feedback.trim().slice(0, 1000) });
    } catch (error) {
      setSaving(false);
      return toast({ title: "提交失败", description: error instanceof Error ? error.message : "接收失败" });
    }
    if (accept.diag.trim()) await supabase.from("patients").update({ cognitive_diagnosis: accept.diag.trim().slice(0, 60), refer_dept: accept.dept }).eq("id", p.id);
    setSaving(false);
    qc.invalidateQueries(); setAccept(null);
    toast({ title: "已接诊确认", description: "指导意见已反馈至社区训练站" });
  };
  const visitDocs = docs.filter(d => d.kind === "诊疗记录");
  const fileDocs = docs.filter(d => d.kind !== "诊疗记录");
  const deviceTrainings = trainings.filter(t => (t as { record_type?: string }).record_type === "设备训练");
  const otherTrainings = trainings.filter(t => (t as { record_type?: string }).record_type !== "设备训练");
  const myRefs = referrals.filter((r) => r.patient_id === p.id);
  const pendingUp = pendingDoctorReferral(myRefs, p.id);
  const pendingDown = pendingCommunityReferral(myRefs, p.id);
  const pendingApproval = referralApprovalQueue(myRefs)[0];
  const transferState = upwardReferralState(myRefs, p.id);
  const transferBusy = transferState === "待审批" || transferState === "已转出";

  const submit = () => {
    if (role === "community" && !communityRiskPatient(p)) return toast({ title: "仅评估确定的中高风险患者可转诊" });
    const direction = sheet === "up" ? "上转" : "下转";
    const reason = note.trim() || (direction === "上转"
      ? `AD-8 ${p.ad8 ?? "-"}，MMSE ${p.mmse ?? "-"}，MoCA ${p.moca ?? "-"}，${p.cognitive_risk ?? "风险待评估"}，申请${upDept}进一步评估`
      : `确诊${p.cognitive_diagnosis ?? ""}，回${station}接续认知训练`);
    createReferral.mutate(
      { patientId: p.id, reason, direction, requireApproval: role === "community" && direction === "上转", toCommunity: direction === "下转" ? station : undefined, dept: direction === "上转" ? upDept : undefined, doctorName: direction === "上转" ? upDoc : "记忆门诊" },
      {
        onSuccess: () => {
          toast({ title: direction === "上转" && role === "community" ? "转诊申请已提交医生审批" : direction === "上转" ? `已转诊至鼓楼医院${upDept} · ${upDoc}` : `已下转${station}`,
            description: direction === "上转" ? "转诊进度将在社区端自动同步" : "训练站需在接诊后 5 个工作日内建档" });
          setSheet(null); setNote("");
        },
        onError: (e) => toast({ title: "提交失败", description: String(e) }),
      },
    );
  };

  const advice = p.ai_plan as Advice | null;
  const recent = [
    ...trainings.map((t) => ({ at: `${t.trained_on}`, text: `${t.domain} · ${t.activity}（${t.duration_min} 分钟）` })),
    ...myRefs.map((r) => ({ at: r.created_at?.slice(0, 10) ?? "", text: `${r.direction}：${r.from_hospital} → ${r.to_community}（${r.approval_status ?? r.status}）` })),
    ...docs.map((d) => ({ at: d.created_at.slice(0, 10), text: `上传${d.kind}` })),
  ].filter((x) => x.at).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4);
  const tags = [...p.risk_tags, ...p.lifestyle_warnings].slice(0, 3);
  const TABS = [["overview", "概览", LayoutGrid], ["info", "基本信息", User], ["scale", "量表评估", BarChart3], ["plan", "方案记录", ClipboardCheck], ["training", "训练记录", Dumbbell], ["referral", "转诊记录", Repeat]] as const;
  const Head = ({ icon: Icon, title, action, badge }: { icon: typeof User; title: string; action?: ReactNode; badge?: ReactNode }) => (
    <div className="mb-3 flex items-center justify-between border-b pb-2"><p className="flex items-center gap-2 whitespace-nowrap text-lg font-bold"><Icon className="h-6 w-6 shrink-0 text-primary" />{title}{badge}</p>{action}</div>
  );
  const More = ({ to, label = "查看全部" }: { to: string; label?: string }) => (
    <button type="button" onClick={() => setTab(to)} className="flex items-center text-sm text-primary">{label}<ChevronRight className="h-4 w-4" /></button>
  );
  const Rows = ({ rows }: { rows: [string, string | null | undefined][] }) => (
    <dl className="space-y-2 text-sm">{rows.map(([k, v]) => <div key={k} className="flex gap-3"><dt className="w-24 shrink-0 text-muted-foreground">{k}</dt><dd className="min-w-0 break-words font-medium">{v || "未登记"}</dd></div>)}</dl>
  );

  const infoCard = (
    <Card className="p-4 shadow-soft">
      <Head icon={User} title="患者基本信息" action={role === "doctor" && <Button size="sm" variant="ghost" className="h-7 text-sm text-primary" onClick={() => openEdit("profile")}><Pencil className="mr-1 h-3.5 w-3.5" />编辑</Button>} />
      <Rows rows={[["性别", p.gender], ["年龄", `${p.age} 岁`], ["联系方式", p.phone], ["来源渠道", p.source], ["照护者", p.caregiver]]} />
    </Card>
  );
  const fullInfoCard = (
    <Card className="p-4 shadow-soft">
      <Head icon={User} title="患者基本信息" action={role === "doctor" && <Button size="sm" variant="ghost" className="h-7 text-sm text-primary" onClick={() => openEdit("profile")}><Pencil className="mr-1 h-3.5 w-3.5" />编辑</Button>} />
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {([["姓名", p.name], ["性别", p.gender], ["年龄", `${p.age} 岁`], ["联系电话", p.phone], ["照护者", p.caregiver], ["来源渠道", p.source], ["过敏史", p.allergy], ["身份证号", p.id_no ? p.id_no.replace(/^(.{6}).+(.{4})$/, "$1********$2") : null]] as [string, string | null][]).map(([k, v]) => (
          <div key={k} className="min-w-0"><dt className="text-muted-foreground">{k}</dt><dd className="mt-0.5 break-words font-medium">{v || "未登记"}</dd></div>
        ))}
      </dl>
      <p className="mt-3 flex flex-wrap gap-1 text-sm"><span className="rounded bg-success/10 px-1.5 py-0.5 text-success">已关联电子健康档案</span><span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">卫生健康云</span></p>
    </Card>
  );
  const healthCard = (
    <Card className="p-4 shadow-soft">
      <Head icon={ShieldPlus} title="健康与既往史" />
      <Rows rows={[...(role !== "community" ? [["主要诊断", p.cognitive_diagnosis ?? "待评估"]] as [string, string][] : []), ["既往疾病", p.past_history], ["用药情况", p.medications], ["家族史", p.family_history], ["病情摘要", p.condition_summary], ["危险因素", tags.length ? [...p.risk_tags, ...p.lifestyle_warnings].join("、") : null], ["过敏史", p.allergy], ["下次复评", p.next_reassess]]} />
    </Card>
  );
  const visitCard = (role === "doctor" || role === "community") && <Card className="p-4 shadow-soft">
    <Head icon={FileText} title={`诊断记录（${visitDocs.length}）`} action={role === "doctor" && <Button size="sm" variant="ghost" className="h-7 text-sm text-primary" onClick={() => setVisitOpen(true)}><Camera className="mr-1 h-4 w-4" />拍照上传</Button>} />
    {visitDocs.length === 0 ? <p className="text-sm text-muted-foreground">{role === "doctor" ? "可拍照上传院内就诊单、门诊病历、检查报告等，社区端同步查看" : "暂无医生上传的诊疗记录"}</p>
      : <div className="grid grid-cols-4 gap-2">{visitDocs.map((d) => d.url && <a key={d.id} href={d.url} target="_blank" rel="noreferrer" className="block"><img src={d.url} alt="诊疗记录" className="h-28 w-full rounded object-cover" /><p className="mt-0.5 truncate text-sm text-muted-foreground">{new Date(d.created_at).toLocaleDateString("zh-CN")}</p></a>)}</div>}
    {role === "community" && visitDocs.length > 0 && <p className="mt-2 text-sm text-muted-foreground">由上级医院医生上传，社区端只读</p>}
    {fileDocs.length > 0 && <><p className="mb-2 mt-4 text-sm font-semibold">建档材料（{fileDocs.length}）</p><div className="grid grid-cols-4 gap-2">{fileDocs.map((d) => d.url && <a key={d.id} href={d.url} target="_blank" rel="noreferrer"><img src={d.url} alt={d.kind} className="h-28 w-full rounded object-cover" /></a>)}</div></>}
  </Card>;
  const scaleCard = (
    <Card className="p-4 shadow-soft">
      <Head icon={Brain} title="认知风险评估" action={<>{role === "doctor" && <span className="flex gap-1"><Button size="sm" className="h-8 text-sm" onClick={() => navigate(`/doctor/assess/${p.id}`)}>量表评估</Button><Button size="sm" variant="ghost" className="h-8 text-sm text-primary" onClick={() => openEdit("assess")}>编辑</Button></span>}{role === "community" && <Button size="sm" variant="ghost" className="h-8 text-sm text-primary" onClick={() => setAssessmentOpen(true)}>量表详情</Button>}</>} />
      <div className="grid grid-cols-6 gap-2">
        <Scale onOpen={() => setScaleOpen("ad8")} label="AD-8 初筛" kind="ad8" value={p.ad8} max={8} />
        <Scale onOpen={() => setScaleOpen("mmse")} label="MMSE" kind="mmse" value={p.mmse} max={30} />
        <Scale onOpen={() => setScaleOpen("moca")} label="MoCA" kind="moca" value={p.moca} max={30} />
        <Scale onOpen={() => setScaleOpen("scd_q9")} label="SCD-Q9" kind="scd_q9" value={p.scd_q9} max={9} />
        <Scale onOpen={() => setScaleOpen("adl")} label="ADL(Barthel)" kind="adl" value={p.adl} max={100} />
        <div className="rounded-lg border bg-card p-2.5"><p className="text-[15.4px] text-muted-foreground">下次复评</p><p className="mt-1 text-sm font-semibold">{p.next_reassess ?? "—"}</p></div>
      </div>
      <p className="mt-2 text-[14px] text-muted-foreground">量表分值参考，不等同综合风险或诊断；MMSE需结合教育程度，MoCA需结合教育校正。</p>
      <div className="mt-3 rounded-lg bg-primary/5 p-2.5 text-sm">
        <span className="text-muted-foreground">{p.ai_risk ? "模型分析风险等级：" : "智能体初步风险等级："}</span>
        {(() => { const r = p.cognitive_risk ?? (p.ai_risk as { risk?: string } | null)?.risk ?? aiRisk; return r ? <span className={`rounded-full px-2 py-0.5 text-sm ${riskTone(r as Patient["cognitive_risk"])}`}>{r}</span> : "量表不足，暂无"; })()}
      </div>
    </Card>
  );
  const referralCard = (
    <Card className="p-4 shadow-soft">
      <Head icon={Repeat} title="平台转诊记录" />
      {myRefs.length === 0 ? <p className="text-sm text-muted-foreground">暂无转诊</p> : myRefs.map((r) => (
        <div key={r.id} className="mb-2 rounded-lg border p-3 text-sm">
          <p className="font-medium">{r.direction} · {r.from_hospital} → {r.to_community} <span className="text-muted-foreground">({r.approval_status === "已转出" && r.status === "已接收" ? "上级医院已接收" : r.approval_status ?? r.status})</span></p>
          <p className="text-muted-foreground">{r.reason}</p>
          {r.approval_note && <p className="mt-1 break-words text-primary">审批意见：{r.approval_note}</p>}
          {r.approved_at && <p className="mt-1 text-muted-foreground">审批时间：{new Date(r.approved_at).toLocaleString("zh-CN")}</p>}
          {r.feedback && <p className="mt-1 rounded bg-primary/5 p-1.5"><span className="font-medium text-primary">指导意见{r.dept ? `（${r.dept}）` : ""}：</span>{r.feedback}</p>}
        </div>
      ))}
    </Card>
  );
  const trainingCard = (
    <Card className="p-4 shadow-soft">
      <Head icon={Dumbbell} title={`训练记录（${trainings.length}）`} action={role === "community" && <Button size="sm" variant="ghost" className="text-sm text-primary" onClick={() => (planItems.length > 0 ? openTask(0) : toast({ title: "暂无可训练项目", description: "该患者的训练方案尚待评估医生确认，确认后即可选择训练项目记录。" }))}>添加干预记录</Button>} />
      <div className="grid grid-cols-2 gap-3">
      {([["设备训练记录", Cpu, deviceTrainings, "暂无认知训练设备同步的记录"], ["非设备干预记录", HandHeart, otherTrainings, "暂无非设备干预记录"]] as const).map(([title, Icon, rows, empty]) => (
        <section key={title} className="rounded-lg border p-3">
          <p className="mb-1 flex items-center gap-1 text-sm font-semibold text-primary"><Icon className="h-4 w-4" />{title} <span className="font-normal text-muted-foreground">({rows.length})</span></p>
          {rows.length === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : rows.map((t) => (
            <div key={t.id} className="border-b py-1.5 text-sm last:border-0">
              <p className="font-medium">{t.domain} · {t.activity}</p><p className="text-muted-foreground">{t.trained_on}{t.training_time ? ` ${t.training_time.slice(0, 5)}` : ""} · {t.duration_min} 分钟 · {t.setting}</p>{t.feedback && <p className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">{title === "设备训练记录" ? "设备结果" : "备注"}：{t.feedback}</p>}
            </div>
          ))}
        </section>
      ))}
      </div>
    </Card>
  );
  const KeyRow = ({ icon: Icon, title, sub, to }: { icon: typeof User; title: string; sub: string; to: string }) => (
    <button type="button" onClick={() => setTab(to)} className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-colors hover:bg-muted/50">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-7 w-7" /></span>
      <span className="min-w-0 flex-1"><span className="block text-lg font-bold">{title}</span><span className="block break-words text-sm text-muted-foreground">{sub}</span></span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </button>
  );
  const week = trainings.filter((t) => Date.now() - new Date(t.trained_on).getTime() < 7 * 864e5).length;

  return (
    <div className="min-h-full bg-muted/30">
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b bg-card px-4 py-3">
        <DoctorBackButton fallback={`/${role}/patients`} />
        <h2 className="text-xl font-semibold">患者详情</h2>
      </div>

      <div className="space-y-3 p-4">
        <Card className="flex items-center gap-5 rounded-2xl border-0 p-5 shadow-soft" style={{ zoom: 0.8 }}>
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-accent/20 text-4xl font-bold text-accent">{p.name[0]}</div>
          <div className="min-w-0 flex-1">
            <p className="text-3xl font-bold">{p.name} <span className="ml-3 text-lg font-normal text-muted-foreground">{p.gender}　{p.age}岁</span></p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {p.cognitive_risk && <span className={`rounded-full px-3 py-0.5 font-medium ${riskTone(p.cognitive_risk)}`}>{p.cognitive_risk}</span>}
              {tags.map((t) => <span key={t} className="rounded-full bg-muted px-3 py-0.5">{t}</span>)}
            </div>
          </div>
          <div className="flex shrink-0 gap-3">
            {role === "doctor" && <>
              <Button className="h-12 rounded-xl px-5 text-base shadow-soft" onClick={() => navigate(`/doctor/plans/${p.id}`)}><ClipboardCheck className="mr-2 !h-5 !w-5" />方案审核</Button>
              <Button variant="outline" className="h-12 rounded-xl border-primary/40 px-5 text-base text-primary" onClick={() => setSheet("down")}><Repeat className="mr-2 !h-5 !w-5" />转诊办理</Button>
              <Button variant="outline" className="h-12 flex-col gap-0 rounded-xl border-primary/40 px-4 text-primary" onClick={() => setVisitOpen(true)}><span className="flex items-center text-base font-semibold"><Camera className="mr-2 !h-5 !w-5" />拍照存档</span><span className="text-xs font-normal text-muted-foreground">就诊单上传 · 同步社区</span></Button>
            </>}
            {role === "community" && <Button size="lg" variant="outline" className="border-primary text-primary" onClick={() => setDocsOpen(true)}><Camera className="mr-1 h-5 w-5" />录入档案</Button>}
            {role !== "doctor" && (role === "community" ? communityRiskPatient(p) : needsReferral(p.cognitive_risk)) && (
              <Button size="lg" disabled={role === "community" && transferBusy} onClick={() => setSheet("up")}><Send className="mr-1 h-5 w-5" />{role === "community" ? "转诊" : "患者上传"}</Button>
            )}
          </div>
          {role === "community" && transferState && <p className="shrink-0 text-sm text-primary">转诊状态：{transferState}</p>}
        </Card>

        {role === "doctor" && pendingApproval && <ReferralApproval key={pendingApproval.id} referral={pendingApproval} />}
        {role === "doctor" && pendingUp && (
          <Card className="border-warning/40 bg-warning/5 p-3 shadow-soft">
            <p className="text-sm font-semibold">上转待接诊 · 来自{pendingUp.from_hospital}</p>
            <p className="mt-1 text-sm text-muted-foreground">{pendingUp.reason}</p>
            <Button size="sm" className="mt-2" onClick={() => setAccept({ rid: pendingUp.id, dept: pendingUp.dept ?? DIAG_DEPTS[0], diag: p.cognitive_diagnosis ?? "", feedback: "" })}>确认接收患者</Button>
          </Card>
        )}
        {role === "community" && pendingDown && <Card className="border-warning/40 bg-warning/5 p-3"><p className="text-sm font-semibold">下转待接收 · {pendingDown.from_hospital}</p><Button size="sm" className="mt-2" disabled={receiveReferral.isPending} onClick={() => receiveReferral.mutate({ referralId: pendingDown.id, patientId: p.id }, { onSuccess: () => { qc.invalidateQueries({ queryKey: ["patient", p.id] }); toast({ title: "患者已加入社区患者列表" }); }, onError: e => toast({ title: "接收失败", description: e.message }) })}>确认接收</Button></Card>}

        <Card className="flex items-center overflow-x-auto rounded-2xl border-0 p-1.5 shadow-soft" style={{ zoom: 0.8 }}>
          {TABS.map(([k, label, Icon], i) => (
            <div key={k} className="flex flex-1 items-center">
              {i > 0 && tab !== k && tab !== TABS[i - 1][0] && <span className="h-6 w-px bg-border" />}
              <button type="button" onClick={() => setTab(k)}
                className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-base transition-colors ${tab === k ? "bg-primary font-semibold text-primary-foreground shadow-soft" : "text-foreground hover:bg-muted"}`}>
                <Icon className="h-5 w-5" />{label}
              </button>
            </div>
          ))}
        </Card>

        {tab === "overview" && (
          <div className="grid gap-4 lg:grid-cols-[1fr_1.45fr_1fr] [&_.rounded-lg.border-card]:rounded-2xl" style={{ zoom: 0.7 }}>
            <div className="space-y-3">
              <Card className="rounded-2xl border-0 p-5 shadow-soft">
                <Head icon={User} title="患者概况" />
                <Rows rows={[["年龄/性别", `${p.age}岁 / ${p.gender}`], ["联系方式", p.phone], ["来源渠道", p.source], ["照护者", p.caregiver]]} />
              </Card>
              <Card className="rounded-2xl border-0 p-5 shadow-soft">
                <Head icon={ClipboardCheck} title="主要诊断与病情" />
                <dl className="divide-y text-sm">{([...(role !== "community" ? [["主要诊断", p.cognitive_diagnosis ?? "待评估"]] : []), ["合并疾病", p.past_history ?? (p.risk_tags.join("、") || null)], ["当前分级", p.cognitive_risk], ["病情摘要", p.condition_summary ?? (p.ai_risk as { summary?: string } | null)?.summary ?? null]] as [string, string | null][]).map(([k, v]) => <div key={k} className="flex gap-3 py-2"><dt className="w-24 shrink-0 text-muted-foreground">{k}</dt><dd className="min-w-0 break-words font-medium">{v || "未登记"}</dd></div>)}</dl>
              </Card>
            </div>
            <div className="space-y-3">
              <Card className="rounded-2xl border-0 p-5 shadow-soft">
                <Head icon={BarChart3} title="最近评估结果" action={<More to="scale" />} />
                <div className="grid grid-cols-4 gap-2">{([["MMSE", "mmse", p.mmse, 30], ["MoCA", "moca", p.moca, 30], ["AD-8", "ad8", p.ad8, 8], ["SCD-Q9", "scd_q9", p.scd_q9, 9]] as const).map(([label, kind, v, max]) => { const r = scalePresentation(kind, v); const tone = { neutral: "text-foreground", low: "text-success", medium: "text-warning", high: "text-destructive" }[r.tone]; const bg = { neutral: "bg-muted", low: "bg-success/10", medium: "bg-warning/10", high: "bg-destructive/10" }[r.tone]; return (
                  <button key={kind} type="button" onClick={() => setScaleOpen(kind)} className="rounded-xl border bg-card p-3 text-left hover:bg-muted/40">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className={`mt-1 text-3xl font-bold ${tone}`}>{v ?? "—"}<span className="text-sm font-normal text-muted-foreground"> /{max}</span></p>
                    <span className={`mt-1 inline-block rounded px-1.5 text-xs ${bg} ${tone}`}>{r.label.split(" ")[0].replace(/参考$/, "")}</span>
                  </button>); })}</div>
              </Card>
              <Card className="rounded-2xl border-0 p-5 shadow-soft">
                <Head icon={ClipboardCheck} title="当前干预方案" badge={advice?.summary && <span className={`ml-2 rounded-full px-3 py-0.5 text-sm font-medium ${planConfirmed(p) ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{planConfirmed(p) ? "已确认" : "待审核"}</span>} action={<More to="plan" label="查看详情" />} />
                {advice?.summary ? <dl className="space-y-2 text-sm">
                  {([[Target, "干预目标", advice.summary], [Layers, "干预措施", (advice.training ?? []).map((t) => `${t.domain}（${t.frequency}）`).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4).join("、")]] as const).map(([I, k, v]) => <div key={k} className="flex gap-2"><I className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><dt className="shrink-0 font-semibold">{k}：</dt><dd className="min-w-0 break-words">{v || "—"}</dd></div>)}
                </dl> : <p className="text-sm text-muted-foreground">尚未生成非药物干预类治疗方案</p>}
              </Card>
              <Card className="rounded-2xl border-0 p-5 shadow-soft">
                <Head icon={Clock} title="近期动态" action={<More to="training" />} />
                {recent.length === 0 ? <p className="text-sm text-muted-foreground">暂无记录</p> : <ol className="text-sm">
                  {recent.map((r, i) => <li key={i} className="relative flex gap-4 pb-3 pl-6 last:pb-0">{i < recent.length - 1 && <span className="absolute left-[5px] top-3 h-full w-0.5 bg-primary/15" />}<span className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${i === 0 ? "bg-primary" : "bg-primary/30"}`} /><span className="w-28 shrink-0 tabular-nums">{r.at}</span><span className="min-w-0 break-words">{r.text}</span></li>)}
                </ol>}
              </Card>
            </div>
            <Card className="space-y-3 rounded-2xl border-0 p-5 shadow-soft">
              <Head icon={ShieldCheck} title="关键记录" />
              <KeyRow icon={BarChart3} title="量表评估" sub={`医生评 MMSE ${p.mmse ?? "—"}/30 · MoCA ${p.moca ?? "—"}/30`} to="scale" />
              <KeyRow icon={ClipboardCheck} title="方案记录" sub={advice?.summary ? (planConfirmed(p) ? "当前方案已确认" : "当前方案待审核") : "暂无方案"} to="plan" />
              <KeyRow icon={Dumbbell} title="训练记录" sub={`近7天 ${week} 次 · 累计 ${trainings.length} 次`} to="training" />
              <KeyRow icon={Repeat} title="转诊记录" sub={myRefs.length ? `共 ${myRefs.length} 次 · 最近：${myRefs[0].direction}（${myRefs[0].approval_status ?? myRefs[0].status}）` : "暂无转诊"} to="referral" />
            </Card>
          </div>
        )}
        {tab === "info" && <><div className="grid gap-3 lg:grid-cols-2">{fullInfoCard}{healthCard}</div>{visitCard}</>}
                {tab === "scale" && <>{scaleCard}{(role === "doctor" || role === "community") && <SelfAssessmentResults patientId={p.id} readOnly assist={role === "doctor"} />}</>}
        {tab === "plan" && (role === "doctor" || role === "community") && <PlanReview p={p} historyOnly confirmedOnly={role === "community"} />}
        {tab === "training" && trainingCard}
        {tab === "referral" && referralCard}

        {role === "nurse" && <Card className="p-4 shadow-soft">
          <p className="mb-2 text-sm font-semibold">已推送宣教</p>
          {edu.length === 0 ? <p className="text-sm text-muted-foreground">暂无</p> : edu.map((e) => (
            <div key={e.id} className="flex justify-between border-b py-1.5 text-sm last:border-0">
              <span>{e.education_items?.title}</span><span className="text-muted-foreground">{e.status}</span>
            </div>
          ))}
        </Card>}

        <p className="flex items-center gap-1 px-1 text-[15.4px] text-muted-foreground">
          <AlertTriangle className="h-3 w-3" />出现急性意识障碍或卒中样症状，立即启动急救。
        </p>
      </div>

      <ScaleDetailSheet patientId={p.id} scale={scaleOpen} onClose={() => setScaleOpen(null)} />
      <ActionSheet open={assessmentOpen} onOpenChange={setAssessmentOpen} title="历史量表记录">
        {role === "community" && <div className="mb-3 flex gap-2"><Button size="sm" variant="outline" className="text-xs" onClick={() => { setAssessmentOpen(false); setAd8(AD8_ITEMS.map(() => false)); }}>AD-8 初筛评估</Button>{p.community_stage === "新接收" && <Button size="sm" variant="outline" className="text-xs" onClick={buildFile}>干预建档</Button>}</div>}
        <AssessmentHistory patientId={p.id} />
      </ActionSheet>

      <ActionSheet open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit?.kind === "profile" ? "录入患者档案" : "编辑认知风险评估"}
        footer={<Button className="w-full" disabled={saving} onClick={saveEdit}>保存</Button>}>
        {edit && (
          <div className="grid grid-cols-2 gap-2">
            {(edit.kind === "profile" ? PROFILE_F as readonly (readonly [string, string])[] : ASSESS_F).map(([k, label]) => (
              <label key={k} className={`text-xs ${["cognitive_diagnosis", "id_no", "past_history", "medications", "family_history", "condition_summary"].includes(k) ? "col-span-2" : ""}`}>{label}
                <Input className="mt-1" type={NUM.includes(k) ? "number" : "text"} value={edit.v[k]} maxLength={200}
                  onChange={(e) => setEdit({ ...edit, v: { ...edit.v, [k]: e.target.value } })} />
              </label>
            ))}
          </div>
        )}
      </ActionSheet>

      <ActionSheet open={!!task} onOpenChange={(o) => !o && setTask(null)} title="记录训练"
        description="训练项目来自 AI 生成、医生确认的训练方案"
        footer={<Button className="w-full" disabled={saving} onClick={saveTask}>确认</Button>}>
        {task && (
          <div className="space-y-3">
            {planItems.length > 0 && (
              <div className="text-xs">
                <p className="mb-1">训练内容（来自医生确认的方案）</p>
                <div className="max-h-44 space-y-1.5 overflow-y-auto pr-0.5">
                  {planItems.map((t, i) => (
                    <button key={i} type="button"
                      onClick={() => setTask({ ...task, planIdx: i, domain: t.domain, activity: t.activity, setting: t.setting === "家庭作业" ? "家庭任务" : t.setting, freq: `${t.frequency} · ${t.duration}`, duration: String(presetDuration(t.duration)) })}
                      className={`w-full rounded-lg border p-2 text-left leading-snug ${(task.planIdx ?? 0) === i ? "border-primary bg-primary/5 font-medium text-primary" : "border-border text-foreground"}`}>
                      {t.domain} · {t.activity}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-lg bg-primary/5 p-2.5 text-xs">
              <p className="font-medium">{task.domain} · {task.setting}</p>
              <p className="mt-0.5">{task.activity}</p>
              {task.freq && <p className="mt-0.5 text-muted-foreground">方案要求：{task.freq}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs">训练日期<Input className="mt-1" type="date" value={task.date} onChange={(e) => setTask({ ...task, date: e.target.value })} /></label>
              <label className="text-xs">训练时间<Input className="mt-1" type="time" value={task.time} onChange={(e) => setTask({ ...task, time: e.target.value })} /></label>
            </div>
            <div className="text-xs">
              <p className="mb-1">训练时长（分钟）</p>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_OPTIONS.map((d) => (
                  <Button key={d} type="button" size="sm" variant={Number(task.duration) === d ? "default" : "outline"} className="h-7 px-2.5 text-xs" onClick={() => setTask({ ...task, duration: String(d) })}>{d}</Button>
                ))}
                <Input className="h-7 w-20 px-2 text-xs" type="number" placeholder="自定义" value={DURATION_OPTIONS.includes(Number(task.duration)) ? "" : task.duration} onChange={(e) => setTask({ ...task, duration: e.target.value })} />
              </div>
            </div>
            <label className="block text-xs">备注<Textarea className="mt-1" rows={3} maxLength={1000} value={task.feedback} onChange={e => setTask({ ...task, feedback: e.target.value })} placeholder="记录参与情况、表现及需关注的问题（选填）" /></label>
          </div>
        )}
      </ActionSheet>

      <ActionSheet open={visitOpen} onOpenChange={setVisitOpen} title="上传诊疗记录" description="拍照上传院内就诊单、门诊病历、检查报告等，同步至社区端">
        <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed py-6 text-sm text-primary">
          <Camera className="h-5 w-5" />{uploading ? "上传中…" : "拍照 / 选择图片上传"}
          <input type="file" accept="image/*" capture="environment" multiple className="hidden" disabled={uploading}
            onChange={(e) => { uploadDocs(e.target.files, "诊疗记录"); e.target.value = ""; }} />
        </label>
      </ActionSheet>

      <ActionSheet open={docsOpen} onOpenChange={setDocsOpen} title="录入档案" description="拍照上传化验单、检查报告、体检单等，用于建档">
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed py-6 text-sm text-primary">
            <Camera className="h-5 w-5" />{uploading ? "上传中…" : "拍照 / 选择图片上传"}
            <input type="file" accept="image/*,application/pdf" capture="environment" multiple className="hidden" disabled={uploading}
              onChange={(e) => { uploadDocs(e.target.files); e.target.value = ""; }} />
          </label>
          {fileDocs.length > 0 ? <div className="grid grid-cols-4 gap-1">{fileDocs.map((d) => d.url && <a key={d.id} href={d.url} target="_blank" rel="noreferrer"><img src={d.url} alt={d.kind} className="h-16 w-full rounded object-cover" /></a>)}</div>
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
        title={sheet === "up" ? role === "community" ? "确认转诊申请 · 等待医生审批" : "转诊至上级医院 · 南京市鼓楼医院" : "确诊下转 · 选择承接机构"}
        description={sheet === "up" ? `${p.name} · 选择门诊与接诊医生` : "填写诊疗建议，训练站接诊后 5 个工作日内建档"}
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
