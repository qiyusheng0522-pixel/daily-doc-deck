import { useNavigate } from "react-router-dom";
import { Users, BookOpen, AlertTriangle, Bell, Stethoscope, CalendarClock, ClipboardCheck, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommunityWork } from "@/data/useCommunityWork";
import { communityScreeningAbnormal } from "@/data/communityReception";
import { HeroCard } from "@/pages/doctor/DoctorHome";

export default function CommunityHome() {
  const navigate = useNavigate();
  const work = useCommunityWork();
  const modules = [
    { label: "全部患者", count: work.community.filter(p => p.ad8 != null).length, icon: Users, tone: "text-primary bg-primary/10", to: "/community/patients" },
    { label: "待评估患者", count: work.assessment.length, icon: ClipboardCheck, tone: "text-primary bg-primary/10", to: "/community/patients?work=assessment" },
    { label: "风险患者", count: work.community.filter(communityScreeningAbnormal).length, icon: AlertTriangle, tone: "text-destructive bg-destructive/10", to: "/community/patients?tab=risk" },
    { label: "待训练患者", count: work.training.length, icon: Dumbbell, tone: "text-success bg-success/10", to: "/community/patients?work=training" },
    { label: "待宣教", count: work.education.length, icon: BookOpen, tone: "text-warning bg-warning/15", to: "/community/education" },
    { label: "待随访", count: work.followup.length, icon: Stethoscope, tone: "text-success bg-success/10", to: "/community/followup?pending=1" },
  ];
  return <div className="space-y-5 px-6 py-2">
    <p className="text-sm text-muted-foreground">小市社区认知训练站 · 今日 {work.list.length} 项待处理</p>
    <section className="grid grid-cols-2 gap-5">{modules.map((m, i) => <HeroCard key={m.label} tone={(["primary", "primary", "destructive", "success", "warning", "success"] as const)[i]} icon={m.icon} title={m.label} desc={`${["在管患者名单与档案", "AD-8 初筛评估", "AD-8 筛查阳性（≥ 2 分）", "今日方案安排的训练", "认知健康宣教内容推送", "随访计划与执行记录"][i]} · ${work.isLoading ? "…" : m.count} 位`} onClick={() => navigate(m.to)} />)}</section>
    <section className="rounded-3xl bg-card p-6 shadow-card ring-1 ring-border/60">
      <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-lg font-bold"><Bell className="h-6 w-6 text-accent" />今日待办清单</h3><span className="text-sm text-muted-foreground">{work.list.length} 项</span></div>
      <ul className="mt-4 divide-y divide-border border-t">{!work.list.length && <li className="py-10 text-center text-sm text-muted-foreground">{work.isLoading ? "加载中…" : "暂无待办"}</li>}{work.list.map(t => <li key={t.id} className="grid grid-cols-[110px_minmax(0,1fr)_150px_110px] items-center gap-4 py-4">
        <span className={`justify-self-start rounded-full px-3 py-1 text-sm font-semibold ${t.kind === "待评估" ? "bg-primary/10 text-primary" : t.kind === "待宣教" ? "bg-warning/15 text-warning" : "bg-success/10 text-success"}`}>{t.kind}</span>
        <p className="truncate text-base font-semibold">{t.title}</p><p className="flex items-center gap-1 text-sm text-muted-foreground"><CalendarClock className="h-4 w-4 shrink-0" />{t.time}</p>
        <Button variant="outline" className="rounded-full border-accent/50 font-semibold text-accent" onClick={() => navigate(t.to)}>去处理</Button>
      </li>)}</ul>
    </section>
  </div>;
}