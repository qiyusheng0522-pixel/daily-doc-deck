import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Brain, ClipboardList, FileCheck2, HeartPulse, History, Home, Layers, MoreHorizontal, Pencil, Plus, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ActionSheet from "@/components/nurse/ActionSheet";
import PlanView from "@/components/cognitive/PlanView";
import type { Advice } from "@/components/cognitive/AiAdvicePanel";
import { useScaleAssessments, useTreatmentPlans, type Patient } from "@/data/patients";
import { assessmentHistory } from "@/data/assessmentHistory";
import { resultLabel } from "./ScaleRecordView";
import { selfRiskLabel } from "@/data/selfRisk";
import { TABLE_GROUPS, planRows, type TableAdvice, type TableGroup } from "@/data/planTable";
import { cn } from "@/lib/utils";

const META: Record<TableGroup, { icon: React.ElementType; desc: string; tone: string }> = {
  非药物干预类: { icon: Brain, desc: "通过认知训练、情绪调节、音乐/运动等方式，促进认知与心理功能改善。", tone: "bg-primary/10 text-primary" },
  危险因子与生活方式干预: { icon: HeartPulse, desc: "识别并管理相关风险因素，改善睡眠、营养等生活方式。", tone: "bg-success/15 text-success" },
  家庭作业: { icon: Home, desc: "在家庭环境中持续巩固训练效果，促进方案落地。", tone: "bg-accent/15 text-accent" },
};
const day = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-CA") : "—");
export const planWeeks = (plan: TableAdvice | null) => plan?.cycle_weeks ?? (Number(plan?.summary?.match(/(\d+)\s*周/)?.[1]) || 8);
const planBasis = (plan: TableAdvice) => [...(plan.doctor_assessments ?? []), ...(plan.self_assessments ?? [])].map(s => `${s.name.replace(/[（(].*$/, "")} ${s.total}`).join("、") || "—";

export default function PlanRecords({ p, role }: { p: Patient; role: "doctor" | "community" }) {
  const navigate = useNavigate();
  const { data: records = [] } = useScaleAssessments(p.id);
  const { data: all = [] } = useTreatmentPlans(p.id);
  const [open, setOpen] = useState<string | null>(null);
  const confirmed = !!p.ai_plan_confirmed_at && (!p.ai_plan_at || p.ai_plan_confirmed_at >= p.ai_plan_at);
  const plan = (role === "community" && !confirmed ? null : p.ai_plan) as TableAdvice | null;
  const rows = useMemo(() => planRows(plan).filter(r => r.enabled), [plan]);
  const current = all.find(h => p.ai_plan_at && Math.abs(new Date(h.created_at).getTime() - new Date(p.ai_plan_at).getTime()) < 5000);
  const history = all.filter(h => h.id !== current?.id && (role === "doctor" || h.confirmed_at));
  const basis = useMemo(() => {
    const h = assessmentHistory(records);
    const one = (keys: string[]) => keys.map(k => h.find(r => r.scale.toLowerCase() === k)).find(Boolean);
    return [one(["moca", "mmse"]), one(["self_depression", "self_anxiety", "self_sleep"])].filter(Boolean).map(r => ({ name: r!.name.match(/[（(]([^)）]+)[)）]/)?.[1] ?? r!.name, total: r!.total, max: r!.max, label: resultLabel(r!)?.label ?? selfRiskLabel(r!.scale, r!.total).label }));
  }, [records]);
  const goals = plan?.goals?.join("、") || plan?.focus?.[0] || "—";
  const selected = all.find(h => h.id === open);

  return <div className="space-y-4">
    <Card className="rounded-2xl border-0 p-5 shadow-soft">
      <div className="flex flex-wrap items-center gap-4 pb-4">
        <p className="flex items-center gap-2 text-xl font-bold"><ClipboardList className="h-6 w-6 text-primary" />当前方案</p>
        <span className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary"><FileCheck2 className="h-4 w-4" />非药物干预类治疗方案</span>
        {plan && <span className="text-sm text-muted-foreground">生成时间：{day(p.ai_plan_at)}<span className="mx-3 text-border">|</span>方案周期：{planWeeks(plan)}周</span>}
        {plan && !confirmed && <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-xs text-warning">待审核</span>}
        {role === "doctor" && <div className="ml-auto flex gap-2">
          <Button variant="outline" className="border-primary/40 text-primary" onClick={() => navigate(`/doctor/plans/${p.id}`)}><Pencil className="mr-1.5 h-4 w-4" />编辑方案</Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="border-primary/40 text-primary" aria-label="更多"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => navigate(`/doctor/plans/${p.id}`)}>方案审核</DropdownMenuItem>{plan && <DropdownMenuItem onClick={() => current && setOpen(current.id)}>查看完整方案</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu>
        </div>}
      </div>
      {!plan ? <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">{role === "doctor" ? <>暂无当前方案<Button className="ml-3" size="sm" onClick={() => navigate(`/doctor/plans/${p.id}`)}><Plus className="mr-1 h-4 w-4" />去生成方案</Button></> : "暂无医生确认的当前方案"}</div> : <>
        <div className="mb-3 grid gap-3 lg:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-primary/5 px-4 py-3 text-sm"><span className="flex items-center gap-2 font-semibold"><Layers className="h-5 w-5 text-primary" />生成依据</span><span className="h-4 w-px bg-border" />
            {basis.length ? basis.map((b, i) => <span key={b.name} className="flex items-center gap-2">{i > 0 && <Plus className="h-4 w-4 text-primary" />}{b.name}：{b.total}/{b.max ?? "—"}<span className={cn("rounded px-1.5 py-0.5 text-xs", /正常|无|好|未达/.test(b.label) ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>{b.label}</span></span>) : "—"}</div>
          <div className="flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3 text-sm"><span className="flex shrink-0 items-center gap-2 font-semibold"><Target className="h-5 w-5 text-primary" />方案目标</span><span className="line-clamp-1 text-muted-foreground">{goals}</span></div>
        </div>
        <div className="space-y-3">{TABLE_GROUPS.map(g => { const m = META[g]; const Icon = m.icon; const list = rows.filter(r => r.group === g); return (
          <div key={g} className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)_auto] items-center gap-5 rounded-xl border px-5 py-3">
            <div className="flex items-center gap-4"><div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-full", m.tone)}><Icon className="h-8 w-8" /></div><div><p className="text-lg font-bold">{g}</p><p className="mt-1 text-sm text-muted-foreground">{m.desc}</p></div></div>
            <ul className="space-y-1 border-l pl-5 text-sm">{list.length ? list.slice(0, 4).map((r, i) => <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span className="line-clamp-1"><b>{r.name}</b>{r.name && "："}{r.content}{r.freq && `，${r.freq}`}</span></li>) : <li className="text-muted-foreground">暂无内容</li>}{list.length > 4 && <li className="pl-3.5 text-xs text-muted-foreground">另有 {list.length - 4} 项</li>}</ul>
            {role === "doctor" ? <Button variant="ghost" size="icon" aria-label={`编辑${g}`} onClick={() => navigate(`/doctor/plans/${p.id}`)}><Pencil className="h-5 w-5 text-primary" /></Button> : <span />}
          </div>); })}</div>
      </>}
    </Card>
    <Card className="rounded-2xl border-0 p-5 shadow-soft">
      <p className="mb-3 flex items-center gap-2 text-xl font-bold"><History className="h-6 w-6 text-primary" />历史方案记录 <span className="text-base font-normal text-muted-foreground">（{history.length}）</span></p>
      <div className="overflow-hidden rounded-xl border"><table className="w-full text-sm">
        <thead className="bg-primary/5 text-left"><tr>{["生成时间", "方案名称", "依据量表", "方案周期", "操作"].map(h => <th key={h} className={cn("px-5 py-2.5 font-semibold", (h === "方案周期" || h === "操作") && "text-center")}>{h}</th>)}</tr></thead>
        <tbody>{history.length === 0 ? <tr><td colSpan={5} className="px-5 py-6 text-center text-muted-foreground">暂无历史方案</td></tr> : history.map(h => { const hp = h.plan as unknown as TableAdvice & { title?: string }; return <tr key={h.id} className="border-t">
          <td className="px-5 py-3">{day(h.created_at)}</td><td className="px-5 py-3">{hp.title ?? "非药物干预类治疗方案"}</td><td className="px-5 py-3">{planBasis(hp)}</td><td className="px-5 py-3 text-center">{planWeeks(hp)}周</td>
          <td className="px-5 py-3 text-center"><button type="button" className="font-medium text-primary underline underline-offset-4" onClick={() => setOpen(h.id)}>查看详情</button></td></tr>; })}</tbody>
      </table></div>
    </Card>
    {selected && <ActionSheet open onOpenChange={v => !v && setOpen(null)} title="方案详情" description={`${p.name} · ${day(selected.created_at)}`}><PlanView advice={selected.plan as unknown as Advice} /></ActionSheet>}
  </div>;
}
