import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Brain, Activity, CalendarDays, Check, ChevronRight, ClipboardList, FileText, Home, MoreHorizontal, Pencil, Plus, RotateCcw, Save, Target, Trash2 } from "lucide-react";
import DoctorBackButton from "@/components/doctor/DoctorBackButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePatient, useScaleAssessments } from "@/data/patients";
import AiAdvicePanel from "@/components/cognitive/AiAdvicePanel";
import { needsReferral } from "@/data/cognitive";
import PlanReview from "@/components/cognitive/PlanReview";
import PlanPrerequisites from "@/components/cognitive/PlanPrerequisites";
import PlanEditor from "@/components/cognitive/PlanEditor";
import ScaleDetailSheet from "@/components/cognitive/ScaleDetailSheet";
import ActionSheet from "@/components/nurse/ActionSheet";
import { assessmentHistory } from "@/data/assessmentHistory";
import { resultLabel } from "@/components/cognitive/ScaleRecordView";
import { TABLE_GROUPS, applyRows, planRows, type PlanRow, type TableAdvice, type TableGroup } from "@/data/planTable";
import { editablePlan, planEditError } from "@/data/treatmentPlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

const GROUP_META: Record<TableGroup, { icon: React.ElementType; desc: string; cols: [string, string, string]; tone: string }> = {
  非药物干预类: { icon: Brain, desc: "通过认知训练、认知刺激等方式，改善认知功能，延缓认知衰退。", cols: ["具体干预内容", "执行频次 / 时长", "执行方式"], tone: "bg-primary/10 text-primary" },
  危险因子与生活方式干预: { icon: Activity, desc: "管理危险因素，建立健康生活方式，降低认知障碍进展风险。", cols: ["具体干预内容", "执行频次 / 时长", "执行方式"], tone: "bg-success/15 text-success" },
  家庭作业: { icon: Home, desc: "由家属协助在家完成，巩固训练效果，促进日常功能维持。", cols: ["具体内容", "执行频次", "完成记录方式"], tone: "bg-warning/15 text-warning" },
};
const selfLabel = (scale: string, total: number) => scale === "self_depression" ? (total < 53 ? "正常" : total <= 62 ? "轻度抑郁" : total <= 72 ? "中度抑郁" : "重度抑郁")
  : scale === "self_anxiety" ? (total < 50 ? "正常" : total <= 59 ? "轻度焦虑" : total <= 69 ? "中度焦虑" : "重度焦虑") : null;

const DoctorPlanDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: p, isLoading } = usePatient(id);
  const { data: records = [] } = useScaleAssessments(id);
  const plan = (p?.ai_plan ?? null) as TableAdvice | null;
  const initial = useMemo(() => planRows(plan), [plan]);
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [editRow, setEditRow] = useState<number | null>(null);
  const [tab, setTab] = useState<"content" | "schedule">("content");
  const [sheet, setSheet] = useState<"generate" | "history" | null>(null);
  const [editing, setEditing] = useState(false);
  const [scale, setScale] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setRows(initial); setEditRow(null); }, [initial]);

  const basis = useMemo(() => {
    const h = assessmentHistory(records);
    const pickOne = (keys: string[]) => keys.map(k => h.find(r => r.scale.toLowerCase() === k)).find(Boolean);
    return [pickOne(["moca", "mmse"]), pickOne(["self_depression", "self_anxiety", "self_sleep"])].filter(Boolean) as ReturnType<typeof assessmentHistory>;
  }, [records]);
  const weeks = plan?.cycle_weeks ?? (Number(plan?.summary?.match(/(\d+)\s*周/)?.[1]) || 8);
  const goals = plan?.goals ?? (plan?.focus ?? []).slice(0, 3);
  const dirty = JSON.stringify(rows) !== JSON.stringify(initial);

  const update = (i: number, patch: Partial<PlanRow>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const removeChecked = (g: TableGroup) => { const n = rows.filter(r => r.group === g && r.enabled).length; if (!n) return toast({ title: "请先勾选要删除的内容" }); setRows(rows.filter(r => !(r.group === g && r.enabled))); setEditRow(null); };
  const add = (g: TableGroup) => { setRows([...rows, { group: g, name: "", content: "", freq: "", mode: g === "家庭作业" ? "家属协助并记录" : "站内小组", enabled: true }]); setEditRow(rows.length); };
  const save = async () => {
    if (!p || !plan) return;
    const next = applyRows(editablePlan(plan, p.cognitive_risk) as TableAdvice, rows, p.cognitive_risk);
    const message = planEditError(next, p.cognitive_risk);
    if (message) return toast({ title: "请先补全方案", description: message });
    setSaving(true);
    const { error } = await supabase.rpc("save_treatment_revision", { _patient_id: p.id, _plan: { ...next, edited_by: "评估医生", edited_at: new Date().toISOString() } as unknown as Json, _expected_at: p.ai_plan_at ?? undefined });
    setSaving(false);
    if (error) return toast({ title: "保存失败", description: error.message });
    await qc.invalidateQueries();
    toast({ title: "修改已保存为新版本", description: "请确认后下发，原方案保留在历史记录中" });
  };

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">加载中…</p>;
  if (!p) return <p className="p-6 text-sm text-muted-foreground">未找到该方案</p>;
  if (!needsReferral(p.cognitive_risk)) return <div className="p-6"><DoctorBackButton fallback="/doctor/plans" /><p className="mt-4 text-sm text-muted-foreground">仅中、高风险患者需医生确认治疗方案</p></div>;

  return (
    <div className="min-h-full space-y-4 bg-muted/30 p-5">
      {/* 头部 */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl bg-card px-5 py-4 shadow-soft">
        <div className="flex min-w-0 items-center gap-3">
          <DoctorBackButton fallback="/doctor/plans" />
          <span className="whitespace-nowrap text-2xl font-bold">{p.name}</span>
          <span className="h-6 w-px bg-border" />
          <span className="whitespace-nowrap text-xl font-semibold">非药物干预类治疗方案</span>
          {plan && <span className={cn("whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", p.ai_plan_confirmed_at && (!p.ai_plan_at || p.ai_plan_confirmed_at >= p.ai_plan_at) ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>{p.ai_plan_confirmed_at && (!p.ai_plan_at || p.ai_plan_confirmed_at >= p.ai_plan_at) ? "已确认" : "待审核"}</span>}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-4 whitespace-nowrap text-sm text-muted-foreground">
          <span>生成时间：<b className="text-foreground">{p.ai_plan_at ? new Date(p.ai_plan_at).toLocaleDateString("en-CA") : "—"}</b></span>
          <span>方案周期：<b className="text-foreground">{weeks}周</b></span>
          <Button variant="outline" disabled={!plan} onClick={() => setEditing(true)}><Pencil className="mr-1.5 h-4 w-4" />编辑方案</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="更多操作"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSheet("generate")}>{plan ? "重新生成方案" : "生成方案"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSheet("history")}>历史方案</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/doctor/patients/${p.id}`)}>查看档案</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 评估依据 + 方案目标 */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl bg-card p-5 shadow-soft">
          <p className="mb-3 flex items-center gap-2 text-lg font-bold"><FileText className="h-5 w-5 text-primary" />评估依据 <span className="text-sm font-normal text-muted-foreground">（{basis.length}份量表）</span></p>
          {basis.length === 0 ? <p className="text-sm text-muted-foreground">暂无量表记录</p> : <div className="grid grid-cols-2 gap-3">{basis.map(r => {
            const label = resultLabel(r)?.label ?? selfLabel(r.scale, r.total);
            return <button key={r.id} type="button" onClick={() => setScale(r.scale)} className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3 text-left hover:bg-muted">
              <div><p className="font-semibold">{r.name}</p><p className="mt-1 text-sm"><b className="text-2xl text-primary">{r.total}</b><span className="text-muted-foreground">/{r.max ?? "—"}</span>{label && <span className={cn("ml-2 rounded px-2 py-0.5 text-xs", label === "正常" ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>{label}</span>}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-CA")}</p></div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>;
          })}</div>}
        </section>
        <section className="rounded-2xl bg-card p-5 shadow-soft">
          <p className="mb-3 flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5 text-primary" />方案目标 <span className="text-sm font-normal text-muted-foreground">（{weeks}周）</span></p>
          {goals.length === 0 ? <p className="text-sm text-muted-foreground">生成方案后显示</p> : <ul className="space-y-2">{goals.map(g => <li key={g} className="flex gap-2 text-sm"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground"><Check className="h-3.5 w-3.5" /></span><span className="line-clamp-2">{g}</span></li>)}</ul>}
        </section>
      </div>

      {/* 方案内容 */}
      <section className="rounded-2xl bg-card shadow-soft">
        <div className="flex items-center justify-between border-b px-5">
          <div className="flex gap-8">{([["content", "方案内容"], ["schedule", "执行计划（日程安排）"]] as const).map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={cn("border-b-2 py-4 text-base font-semibold", tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>{l}</button>)}</div>
          {plan && <div className="flex gap-2"><Button variant="outline" disabled={!dirty || saving} onClick={() => { setRows(initial); setEditRow(null); }}><RotateCcw className="mr-1.5 h-4 w-4" />重置方案</Button><Button disabled={!dirty || saving} onClick={save}><Save className="mr-1.5 h-4 w-4" />{saving ? "保存中…" : "保存修改"}</Button></div>}
        </div>
        {!plan ? <div className="p-8 text-center"><p className="text-muted-foreground">该患者尚未生成个性化方案，需先完成他评与自评量表。</p><Button className="mt-4" onClick={() => setSheet("generate")}>查看前置条件并生成方案</Button></div>
          : tab === "content" ? <div className="divide-y">{TABLE_GROUPS.map(g => {
            const meta = GROUP_META[g]; const Icon = meta.icon;
            const list = rows.map((r, i) => [r, i] as const).filter(([r]) => r.group === g);
            return <div key={g} className="grid grid-cols-[220px_1fr] gap-5 px-5 py-4">
              <div><div className={cn("mb-2 flex h-12 w-12 items-center justify-center rounded-xl", meta.tone)}><Icon className="h-6 w-6" /></div><p className="text-lg font-bold">{g}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{meta.desc}</p></div>
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full table-fixed text-sm">
                  <thead className="bg-muted/50 text-left text-muted-foreground"><tr><th className="w-[52%] px-3 py-2 font-medium">{meta.cols[0]}</th><th className="w-[22%] px-3 py-2 font-medium">{meta.cols[1]}</th><th className="px-3 py-2 font-medium">{meta.cols[2]}</th><th className="w-10" /></tr></thead>
                  <tbody>{list.length === 0 ? <tr><td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">暂无内容</td></tr> : list.map(([r, i]) => editRow === i
                    ? <tr key={i} className="border-t bg-primary/5"><td className="space-y-1 px-3 py-2"><Input placeholder="名称" value={r.name} onChange={e => update(i, { name: e.target.value })} /><Input placeholder="具体内容" value={r.content} onChange={e => update(i, { content: e.target.value })} /></td><td className="px-3 py-2"><Input value={r.freq} onChange={e => update(i, { freq: e.target.value })} /></td><td className="px-3 py-2"><Input value={r.mode} onChange={e => update(i, { mode: e.target.value })} /></td><td className="px-2"><Button size="icon" variant="ghost" aria-label="完成编辑" onClick={() => setEditRow(null)}><Check className="h-4 w-4 text-primary" /></Button></td></tr>
                    : <tr key={i} className={cn("border-t align-top", !r.enabled && "text-muted-foreground")}>
                      <td className="px-3 py-2.5"><label className="flex gap-2"><Checkbox className="mt-0.5" checked={r.enabled} onCheckedChange={v => update(i, { enabled: !!v })} /><span className="line-clamp-3"><b className="text-foreground">{r.name}{r.name && "："}</b>{r.content}</span></label></td>
                      <td className="px-3 py-2.5">{r.freq || "—"}</td><td className="px-3 py-2.5">{r.mode || "—"}</td>
                      <td className="px-2 py-1.5"><Button size="icon" variant="ghost" aria-label="编辑此项" onClick={() => setEditRow(i)}><Pencil className="h-4 w-4 text-primary" /></Button></td>
                    </tr>)}</tbody>
                </table>
                <div className="flex justify-end gap-2 border-t bg-muted/20 px-3 py-2"><Button size="sm" variant="ghost" aria-label={`删除勾选的${g}`} onClick={() => removeChecked(g)}><Trash2 className="h-4 w-4 text-destructive" /></Button><Button size="sm" variant="outline" className="text-primary" onClick={() => add(g)}><Plus className="mr-1 h-4 w-4" />添加</Button></div>
              </div>
            </div>;
          })}</div>
          : <div className="p-5"><table className="w-full text-sm"><thead className="bg-muted/50 text-left text-muted-foreground"><tr><th className="px-3 py-2">类别</th><th className="px-3 py-2">内容</th><th className="px-3 py-2"><CalendarDays className="mr-1 inline h-4 w-4" />频次 / 时长</th><th className="px-3 py-2">执行方式</th></tr></thead>
            <tbody>{rows.filter(r => r.enabled).map((r, i) => <tr key={i} className="border-t"><td className="px-3 py-2 text-muted-foreground">{r.group}</td><td className="px-3 py-2">{r.name}{r.name && "："}{r.content}</td><td className="px-3 py-2">{r.freq}</td><td className="px-3 py-2">{r.mode}</td></tr>)}</tbody></table>
            {plan.followup && <p className="mt-4 flex items-start gap-2 text-sm"><ClipboardList className="mt-0.5 h-4 w-4 text-primary" />随访：{plan.followup.cycle}；复评：{plan.followup.reassess}</p>}</div>}
      </section>

      {plan && <PlanReview p={p} showCurrent={false} />}
      {editing && <PlanEditor p={p} onClose={() => setEditing(false)} />}
      <ScaleDetailSheet patientId={p.id} scale={scale} onClose={() => setScale(null)} />
      <ActionSheet open={sheet === "generate"} onOpenChange={v => !v && setSheet(null)} title="生成方案">
        <div className="space-y-3"><PlanPrerequisites patientId={p.id} /><AiAdvicePanel key={`${p.id}-${p.ai_plan_at}`} patientId={p.id} name={p.name} saved={p.ai_plan} savedAt={p.ai_plan_at} compact /></div>
      </ActionSheet>
      <ActionSheet open={sheet === "history"} onOpenChange={v => !v && setSheet(null)} title="历史方案"><PlanReview p={p} historyOnly /></ActionSheet>
    </div>
  );
};
export default DoctorPlanDetail;
