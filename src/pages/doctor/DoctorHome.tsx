import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ClipboardCheck, Hospital, ListChecks } from "lucide-react";
import { planConfirmed, needsReferral } from "@/data/cognitive";
import { Button } from "@/components/ui/button";
import { doctorReceptionQueue } from "@/data/doctorReception";
import { referralApprovalQueue } from "@/data/referralApproval";
import { usePatients, useReferrals } from "@/data/patients";

type Kind = "待审核" | "待接收" | "待审批";
const AVATAR = ["bg-primary/10 text-primary", "bg-warning/15 text-warning", "bg-success/10 text-success", "bg-accent/15 text-accent"];
const TAG: Record<Kind, string> = { 待审核: "bg-primary/10 text-primary", 待接收: "bg-success/10 text-success", 待审批: "bg-warning/15 text-warning" };
const ACTION: Record<Kind, string> = { 待审核: "去审核", 待接收: "去接收", 待审批: "去审批" };

const DoctorHome = () => {
  const navigate = useNavigate();
  const { data: patients = [] } = usePatients("all");
  const { data: referrals = [] } = useReferrals();
  const byId = new Map(patients.map(p => [p.id, p]));
  const reviews = patients.filter(p => needsReferral(p.cognitive_risk) && !planConfirmed(p));
  const fmt = (d?: string | null) => d ? new Date(d).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "待生成方案";

  const todos = [
    ...referralApprovalQueue(referrals).map(r => ({ id: `a-${r.id}`, kind: "待审批" as Kind, pid: r.patient_id, desc: "社区转诊申请审批", time: fmt(r.created_at), to: `/doctor/patients/${r.patient_id}` })),
    ...doctorReceptionQueue(referrals).map(r => ({ id: `r-${r.id}`, kind: "待接收" as Kind, pid: r.patient_id, desc: `转诊待接收 · 来自${r.from_hospital}`, time: fmt(r.created_at), to: `/doctor/patients/${r.patient_id}` })),
    ...reviews.map(p => ({ id: `p-${p.id}`, kind: "待审核" as Kind, pid: p.id, desc: `${p.cognitive_risk} · 非药物干预方案审核`, time: fmt(p.ai_plan_at), to: `/doctor/plans/${p.id}` })),
  ];
  const [tab, setTab] = useState<"全部" | Kind>("全部");
  const tabs = (["全部", "待审核", "待接收", "待审批"] as const).map(t => [t, t === "全部" ? todos.length : todos.filter(x => x.kind === t).length] as const);
  const list = tab === "全部" ? todos : todos.filter(x => x.kind === tab);

  return (
    <div className="space-y-5 px-6 py-2">
      <section className="grid grid-cols-2 gap-5">
        <HeroCard tone="primary" icon={ClipboardCheck} title="方案审核" desc={`审核评估结论与非药物干预方案 · ${reviews.length} 项`} onClick={() => navigate("/doctor/plans")} />
        <HeroCard tone="success" icon={Hospital} title="转诊办理" desc={`接收社区转诊并跟踪进展 · ${todos.filter(t => t.kind !== "待审核").length} 项`} onClick={() => navigate("/doctor/patients")} />
      </section>
      <section className="rounded-3xl bg-card p-6 shadow-card ring-1 ring-border/60">
        <h3 className="flex items-center gap-2 text-lg font-bold"><ListChecks className="h-6 w-6 text-primary" />我的待办</h3>
        <div className="mt-4 flex gap-3">
          {tabs.map(([t, n]) => <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors ${tab === t ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "bg-muted text-foreground/80 hover:bg-muted/70"}`}>{t} ({n})</button>)}
        </div>
        <ul className="mt-4 divide-y divide-border border-t">
          {!list.length && <li className="py-10 text-center text-sm text-muted-foreground">暂无待办</li>}
          {list.map((t, i) => { const p = byId.get(t.pid); return (
            <li key={t.id} className="grid grid-cols-[56px_1fr_120px_140px_120px] items-center gap-4 py-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold ${AVATAR[i % AVATAR.length]}`}>{p?.name[0] ?? "患"}</div>
              <div className="min-w-0"><p className="text-base font-bold">{p?.name ?? "患者"} <span className="ml-3 text-sm font-normal text-muted-foreground">{p ? `${p.gender} · ${p.age}岁` : ""}</span></p><p className="mt-1 truncate text-sm text-muted-foreground">{t.desc}</p></div>
              <span className={`justify-self-start rounded-full px-4 py-1.5 text-sm font-semibold ${TAG[t.kind]}`}>{t.kind}</span>
              <span className="text-sm text-muted-foreground">{t.time}</span>
              <Button variant="outline" className="rounded-full border-primary/50 font-semibold text-primary" onClick={() => navigate(t.to)}>{ACTION[t.kind]}</Button>
            </li>); })}
        </ul>
      </section>
    </div>
  );
};

export function HeroCard({ tone, icon: Icon, title, desc, onClick }: { tone: "primary" | "success" | "warning" | "destructive"; icon: React.ElementType; title: string; desc: string; onClick: () => void }) {
  const t = { primary: ["from-primary/15 to-accent/5", "bg-primary/15 text-primary"], success: ["from-success/15 to-accent/10", "bg-success/15 text-success"], warning: ["from-warning/15 to-warning/5", "bg-warning/20 text-warning"], destructive: ["from-destructive/10 to-destructive/5", "bg-destructive/15 text-destructive"] }[tone];
  return (
    <button onClick={onClick} className={`group relative flex items-center gap-6 overflow-hidden rounded-3xl bg-gradient-to-br ${t[0]} p-7 text-left shadow-card ring-1 ring-border/60 transition-transform hover:-translate-y-0.5`}>
      <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl ${t[1]}`}><Icon className="h-12 w-12" /></div>
      <div className="min-w-0 flex-1 pr-12"><p className="text-3xl font-bold">{title}</p><p className="mt-2 text-sm text-muted-foreground">{desc}</p></div>
      <span className="absolute bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-card text-primary shadow-card"><ArrowRight className="h-5 w-5" /></span>
    </button>
  );
}

export default DoctorHome;
