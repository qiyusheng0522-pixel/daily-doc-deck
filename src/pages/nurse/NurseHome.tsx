import { useNavigate } from "react-router-dom";
import {
  Users, MessageSquare, BookOpen, LogOut as LogOutIcon, Activity,
  ClipboardCheck, ChevronRight, Stethoscope,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  usePatients,
  useNurseTasks,
  useFollowups,
  useReferrals,
  useMyProfile,
  sourceLabel,
} from "@/data/patients";

const NurseHome = () => {
  const navigate = useNavigate();
  const { data: inpatients = [] } = usePatients("hospital");
  const { data: tasks = [] } = useNurseTasks();
  const { data: followups = [] } = useFollowups();
  const { data: referrals = [] } = useReferrals();
  const { data: profile } = useMyProfile();

  const pendingTasks = tasks.filter((t) => t.status === "待执行");
  const eduPending = tasks.filter((t) => t.kind === "宣教" && t.status === "待执行").length;
  const handoverPending = inpatients.filter((p) => p.hospital_stage === "待转诊").length;
  const followupPending = followups.filter((f) => f.status !== "已完成").length;

  const todoItems = [
    {
      key: "patients", icon: Users, label: "患者", sub: "在管 · 记忆门诊",
      count: inpatients.length, unit: "在期", color: "text-primary", bg: "bg-primary/10",
      to: "/nurse/patients",
    },
    {
      key: "chat", icon: MessageSquare, label: "待回复", sub: "患者/医生消息",
      count: pendingTasks.filter((t) => t.kind === "待办").length, unit: "条待处理", color: "text-success", bg: "bg-success/10",
      to: "/nurse/chat",
    },
    {
      key: "education", icon: BookOpen, label: "待宣教内容", sub: "护脑饮食 / 抗凝用药",
      count: eduPending, unit: "条待推送", color: "text-warning", bg: "bg-warning/10",
      to: "/nurse/education",
    },
    {
      key: "handover", icon: LogOutIcon, label: "出院转交", sub: "下转小市社区",
      count: handoverPending, unit: "位待交接", color: "text-primary", bg: "bg-primary/10",
      to: "/nurse/handover",
    },
    {
      key: "followup", icon: Stethoscope, label: "随访", sub: "出院后随访",
      count: followupPending, unit: "位待随访", color: "text-accent", bg: "bg-accent/10",
      to: "/nurse/followup",
    },
  ];

  const pendingTotal = todoItems.reduce((a, b) => a + b.count, 0);

  const typeStyle: Record<string, string> = {
    "宣教": "bg-accent/10 text-accent",
    "待办": "bg-primary/10 text-primary",
    "出院下转": "bg-success/10 text-success",
  };

  return (
    <div className="space-y-3 p-4">
      <Card className="bg-gradient-nurse p-4 text-primary-foreground shadow-soft">
        <h2 className="text-base font-semibold">{profile?.full_name ?? "评估师"}，早上好 👋</h2>
        <p className="mt-0.5 text-[11px] opacity-90">
          {profile?.department ?? "记忆门诊"} · 今日 {pendingTotal} 项待处理
        </p>
      </Card>

      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">今日待办</h3>
        </div>
        <Badge variant="secondary" className="h-5">共 {pendingTotal} 项</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {todoItems.map((t) => (
          <button
            key={t.key}
            onClick={() => navigate(t.to)}
            className="group relative flex items-center justify-between rounded-2xl border bg-card p-3.5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${t.bg}`}>
                <t.icon className={`h-5 w-5 ${t.color}`} />
              </div>
              <p className="text-[13px] font-medium text-foreground">{t.label}</p>
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{t.sub}</p>
            </div>
            <div className="ml-2 flex shrink-0 flex-col items-end">
              <span className={`text-2xl font-bold leading-none ${t.color}`}>{t.count}</span>
              <span className="mt-1 text-[10px] text-muted-foreground">{t.unit}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-1 pt-2">
        <div className="flex items-center gap-1.5">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">今日待办清单</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">共 {pendingTasks.length} 项 · 按优先级</span>
      </div>
      <Card className="overflow-hidden">
        <div className="divide-y">
          {pendingTasks.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">暂无待办</p>}
          {pendingTasks.map((t, i) => {
            const name = t.patients?.name ?? "患者";
            const bed = t.patients?.bed_number;
            return (
              <button
                key={t.id}
                onClick={() => {
                  const action = t.kind === "宣教" ? "?action=push-edu" : t.kind === "转诊" ? "?action=handover" : "";
                  navigate(`/nurse/patients/${t.patient_id}${action}`);
                }}
                className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/40"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${typeStyle[t.kind] ?? "bg-muted text-muted-foreground"}`}>
                      {t.kind}
                    </span>
                    <span className="text-[13px] font-semibold">
                      {bed ? `床 ${bed} ` : ""}{name}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">
                    {t.title}{t.due_text ? ` · ${t.due_text}` : ""}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">下转社区进度</h3>
          <span className="text-[11px] text-muted-foreground">
            待接收 {referrals.filter((r) => r.status === "待接收").length} · 已接收 {referrals.filter((r) => r.status === "已接收").length}
          </span>
        </div>
        <div className="divide-y">
          {referrals.slice(0, 3).map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${r.status === "待接收" ? "bg-warning/15 text-warning" : "bg-success/10 text-success"}`}>
                {r.status}
              </span>
              <span className="text-[13px] font-medium">{r.patients?.name ?? "患者"}</span>
              <span className="text-[11px] text-muted-foreground">{r.to_community}</span>
              {r.patients && <span className="ml-auto text-[10px] text-muted-foreground">{sourceLabel(r.patients.source)}</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default NurseHome;
