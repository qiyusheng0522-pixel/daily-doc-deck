import { Link, useNavigate } from "react-router-dom";
import { Users, BookOpen, AlertTriangle, Bell, Stethoscope, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroCard } from "@/pages/doctor/DoctorHome";
import { usePatients, useFollowups, useReferrals, useEducationItems, useMyProfile, useTrainingRecords } from "@/data/patients";
import { communityRiskPatient, communityScreeningAbnormal, filterCommunityPatients, pendingCommunityReferral } from "@/data/communityReception";

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
  const abnormal = community.filter(communityScreeningAbnormal);
  const riskPatients = community.filter(communityRiskPatient);
  const today = new Date().toLocaleDateString("sv-SE");
  const tasks = [
    ...community.flatMap(p => { const r = pendingCommunityReferral(referrals, p.id); return r ? [{ id: `receive-${p.id}`, type: "接收", title: `${p.name} · 下转待接收`, time: r.created_at.slice(0, 10), to: "/community/patients?tab=new" }] : []; }),
    ...abnormal.map(p => ({ id: `abnormal-${p.id}`, type: "异常", title: `${p.name} · AD-8 筛查阳性`, time: p.last_visit ?? "待进一步评估", to: `/community/patients/${p.id}` })),
    ...trainings.filter(t => ids.has(t.patient_id) && t.completion === "待执行" && t.trained_on <= today).map(t => ({ id: `train-${t.id}`, type: "训练", title: `${community.find(p => p.id === t.patient_id)?.name ?? "患者"} · ${t.domain}`, time: t.trained_on, to: `/community/patients/${t.patient_id}` })),
    ...pendingFollowups.map(f => ({ id: `followup-${f.id}`, type: "随访", title: `${f.patients?.name ?? "患者"} · ${f.item}`, time: f.status, to: "/community/followup" })),
  ];
  const modules = [
    { label: "全部患者", desc: "在管患者名单与档案", count: community.length, icon: Users, tone: "text-primary", bg: "bg-primary/10", to: "/community/patients" },
    { label: "患者宣教", desc: "认知健康宣教内容推送", count: eduItems.length, icon: BookOpen, tone: "text-warning", bg: "bg-warning/15", to: "/community/education" },
    { label: "智能随访", desc: "随访计划与执行记录", count: pendingFollowups.length, icon: Stethoscope, tone: "text-success", bg: "bg-success/10", to: "/community/followup" },
    { label: "风险患者", desc: "评估确定的中高风险患者", count: riskPatients.length, icon: AlertTriangle, tone: "text-destructive", bg: "bg-destructive/10", to: "/community/patients?tab=risk" },
  ];
  const heroTone = ["primary", "warning", "success", "destructive"] as const;
  return <div className="space-y-5 px-6 py-2">
    <p className="text-sm text-muted-foreground">小市社区认知训练站 · 今日 {tasks.length} 项待处理</p>
    <section className="grid grid-cols-2 gap-3">{modules.map((m, i) => <HeroCard key={m.label} tone={heroTone[i]} icon={m.icon} title={`${m.label} ${m.count}`} desc={m.desc} onClick={() => navigate(m.to)} />)}</section>
    <section className="rounded-3xl bg-card p-6 shadow-card ring-1 ring-border/60"><div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-lg font-bold"><Bell className="h-6 w-6 text-accent" />今日待办清单</h3><span className="text-sm text-muted-foreground">{tasks.length} 项</span></div>
      <ul className="mt-4 divide-y divide-border border-t">{!tasks.length && <li className="py-10 text-center text-sm text-muted-foreground">暂无待办</li>}{tasks.map(t => <li key={t.id} className="grid grid-cols-[80px_1fr_160px_110px] items-center gap-4 py-4"><span className={`justify-self-start rounded-full px-4 py-1.5 text-sm font-semibold ${t.type === "异常" ? "bg-destructive/10 text-destructive" : t.type === "接收" ? "bg-warning/15 text-warning" : "bg-success/10 text-success"}`}>{t.type}</span><p className="truncate text-base font-semibold">{t.title}</p><p className="flex items-center gap-1 text-sm text-muted-foreground"><CalendarClock className="h-4 w-4" />{t.time}</p><Button variant="outline" className="rounded-full border-accent/50 font-semibold text-accent" onClick={() => navigate(t.to)}>去处理</Button></li>)}</ul></section>
  </div>;
};
export default CommunityHome;
