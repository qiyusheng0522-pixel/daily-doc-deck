import { useNavigate } from "react-router-dom";
import { Users, BookOpen, AlertTriangle, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatients, useFollowups, useReferrals, useEducationItems } from "@/data/patients";
import { filterCommunityPatients } from "@/data/communityReception";

export default function CommunityHome() {
  const navigate = useNavigate();
  const { data: patients = [] } = usePatients("all");
  const { data: referrals = [] } = useReferrals();
  const { data: followups = [] } = useFollowups();
  const { data: education = [] } = useEducationItems();
  const list = filterCommunityPatients(patients, referrals, { reception: "全部患者", risk: "全部", source: "全部", gender: "全部", query: "", abnormal: false });
  const modules = [
    { label: "全部患者", icon: Users, count: list.length, to: "/community/patients", tone: "text-accent", bg: "bg-accent/10" },
    { label: "宣教", icon: BookOpen, count: education.length, to: "/community/education", tone: "text-warning", bg: "bg-warning/10" },
    { label: "随访", icon: Stethoscope, count: followups.filter(f => f.status !== "已完成").length, to: "/community/followup", tone: "text-primary", bg: "bg-primary/10" },
    { label: "异常", icon: AlertTriangle, count: list.filter(p => p.abnormal).length, to: "/community/patients?tab=abnormal", tone: "text-destructive", bg: "bg-destructive/10" },
  ];
  return <div className="grid grid-cols-2 gap-3 p-4">{modules.map(m => <Button key={m.label} variant="outline" onClick={() => navigate(m.to)} className="h-auto min-h-36 flex-col items-start gap-3 rounded-lg bg-card p-4 shadow-soft">
    <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${m.bg}`}><m.icon className={`h-5 w-5 ${m.tone}`} /></span>
    <span className="flex w-full items-center justify-between gap-2"><span className="text-sm font-semibold">{m.label}</span><span className={`text-2xl font-bold ${m.tone}`}>{m.count}</span></span>
  </Button>)}</div>;
}
