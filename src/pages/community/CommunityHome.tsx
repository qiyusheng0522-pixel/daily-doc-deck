import { Link, useNavigate } from "react-router-dom";
import { Users, BookOpen, AlertTriangle, Bell, Stethoscope, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatients, useFollowups, useReferrals, useEducationItems, useMyProfile, useTrainingRecords } from "@/data/patients";
import { filterCommunityPatients, pendingCommunityReferral } from "@/data/communityReception";

const CommunityHome = () => {
  const navigate = useNavigate();
  const { data: patients = [] } = usePatients("all");
  const { data: referrals = [] } = useReferrals();
  const { data: followups = [] } = useFollowups();
  const { data: trainings = [] } = useTrainingRecords();
  const { data: eduItems = [] } = useEducationItems();
  const { data: profile } = useMyProfile();
  const community = filterCommunityPatients(patients, referrals, { reception: "全部患者", risk: "全部", source: "全部", gender: "全部", query: "" });
  const ids = new Set(community.map(p => p.id));
  const pendingFollowups = followups.filter(f => ids.has(f.patient_id) && f.status !== "已完成");
  const abnormal = community.filter(p => p.abnormal);
  const today = new Date().toLocaleDateString("sv-SE");
  const tasks = [
    ...community.flatMap(p => { const r = pendingCommunityReferral(referrals, p.id); return r ? [{ id: `receive-${p.id}`, type: "接收", title: `${p.name} · 下转待接收`, time: r.created_at.slice(0, 10), to: "/community/patients?tab=new" }] : []; }),
    ...abnormal.map(p => ({ id: `abnormal-${p.id}`, type: "异常", title: `${p.name} · 异常待处理`, time: p.last_visit ?? "待处理", to: `/community/patients/${p.id}` })),
    ...trainings.filter(t => ids.has(t.patient_id) && t.completion === "待执行" && t.trained_on <= today).map(t => ({ id: `train-${t.id}`, type: "训练", title: `${community.find(p => p.id === t.patient_id)?.name ?? "患者"} · ${t.domain}`, time: t.trained_on, to: `/community/patients/${t.patient_id}` })),
    ...pendingFollowups.map(f => ({ id: `followup-${f.id}`, type: "随访", title: `${f.patients?.name ?? "患者"} · ${f.item}`, time: f.status, to: "/community/followup" })),
  ];
  const modules = [
    { label: "全部患者", count: community.length, icon: Users, tone: "text-primary", bg: "bg-primary/10", to: "/community/patients" },
    { label: "宣教", count: eduItems.length, icon: BookOpen, tone: "text-warning", bg: "bg-warning/15", to: "/community/education" },
    { label: "随访", count: pendingFollowups.length, icon: Stethoscope, tone: "text-success", bg: "bg-success/10", to: "/community/followup" },
    { label: "异常", count: abnormal.length, icon: AlertTriangle, tone: "text-destructive", bg: "bg-destructive/10", to: "/community/patients?tab=abnormal" },
  ];
  return <div className="space-y-4 p-4">
    <section className="py-1"><h2 className="text-xl font-semibold">{profile?.full_name ?? "社区工作人员"}，您好</h2><p className="mt-1 text-xs text-muted-foreground">小市社区认知训练站 · {tasks.length} 项待处理</p></section>
    <section className="grid grid-cols-2 gap-3">{modules.map(m => <Link key={m.label} to={m.to} className="block rounded-lg bg-card p-4 shadow-sm ring-1 ring-border/60"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${m.bg}`}><m.icon className={`h-5 w-5 ${m.tone}`} /></div><p className="mt-3 text-2xl font-semibold">{m.count}</p><p className="mt-1 text-xs text-muted-foreground">{m.label}</p></Link>)}</section>
    <section><div className="mb-2 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-semibold"><Bell className="h-4 w-4 text-primary" />今日待办清单</h3><span className="text-xs text-muted-foreground">{tasks.length} 项</span></div><ul className="divide-y divide-border">{!tasks.length && <li className="py-6 text-center text-sm text-muted-foreground">暂无待办</li>}{tasks.map(t => <li key={t.id} className="flex items-center gap-2 py-3"><span className={`shrink-0 rounded px-2 py-1 text-[11px] ${t.type === "异常" ? "bg-destructive/10 text-destructive" : t.type === "接收" ? "bg-warning/15 text-warning" : "bg-success/10 text-success"}`}>{t.type}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{t.title}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><CalendarClock className="h-3 w-3" />{t.time}</p></div><Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => navigate(t.to)}>处理</Button></li>)}</ul></section>
  </div>;
};
export default CommunityHome;
