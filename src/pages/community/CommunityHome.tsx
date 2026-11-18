import { useNavigate } from "react-router-dom";
import { Users, BookOpen, MessageSquare, AlertTriangle, Activity, ClipboardCheck, ChevronRight, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  usePatients,
  useFollowups,
  useReferrals,
  useUploads,
  useEducationItems,
  useMyProfile,
  sourceLabel,
} from "@/data/patients";

const CommunityHome = () => {
  const navigate = useNavigate();
  const { data: managed = [] } = usePatients("community");
  const { data: followups = [] } = useFollowups();
  const { data: referrals = [] } = useReferrals();
  const { data: uploads = [] } = useUploads();
  const { data: eduItems = [] } = useEducationItems();
  const { data: profile } = useMyProfile();

  const waitingReferrals = referrals.filter((r) => r.status === "待接收" && r.direction === "下转");
  const followupPending = followups.filter((f) => f.status !== "已完成").length;
  const abnormal = managed.filter((p) => p.abnormal);

  const flow = [
    { label: "承接建档", n: waitingReferrals.length, unit: "待接收", to: "/community/patients?tab=new" },
    { label: "训练与家庭任务", n: managed.filter((p) => p.community_stage === "干预中").length, unit: "干预中", to: "/community/patients" },
    { label: "记录执行", n: managed.length, unit: "在管", to: "/community/patients" },
    { label: "随访", n: followupPending, unit: "待随访", to: "/community/followup" },
  ];

  const todoItems = [
    {
      key: "patients", icon: Users, label: "患者档案", sub: "在管 · 小市社区",
      count: managed.length, unit: "在管", color: "text-primary", bg: "bg-primary/10",
      to: "/community/patients",
    },
    {
      key: "referral", icon: ClipboardCheck, label: "待接收下转", sub: "来自鼓楼医院",
      count: waitingReferrals.length, unit: "位待接收", color: "text-warning", bg: "bg-warning/10",
      to: "/community/patients?tab=new",
    },
    {
      key: "education", icon: BookOpen, label: "宣教", sub: "认知障碍 / 认知训练管理",
      count: eduItems.length, unit: "条可推送", color: "text-warning", bg: "bg-warning/10",
      to: "/community/education",
    },
    {
      key: "abnormal", icon: AlertTriangle, label: "异常", sub: "异常患者待处置",
      count: abnormal.length, unit: "位异常", color: "text-destructive", bg: "bg-destructive/10",
      to: "/community/patients?tab=abnormal",
    },
    {
      key: "followup", icon: Stethoscope, label: "随访", sub: "出院后随访",
      count: followupPending, unit: "位待随访", color: "text-warning", bg: "bg-warning/10",
      to: "/community/followup",
    },
    {
      key: "upload", icon: MessageSquare, label: "已上传鼓楼", sub: "单患者上传记录",
      count: uploads.length, unit: "条", color: "text-success", bg: "bg-success/10",
      to: "/community/patients",
    },
  ];

  const total = todoItems.reduce((a, b) => a + b.count, 0);

  const typeStyle: Record<string, string> = {
    "接收": "bg-warning/15 text-warning",
    "随访": "bg-accent/10 text-accent",
    "上传": "bg-success/10 text-success",
  };

  const taskList = [
    ...waitingReferrals.map((r) => ({
      id: r.id,
      type: "接收",
      name: r.patients?.name ?? "患者",
      sub: `${r.reason ?? "出院下转"} · ${r.from_hospital}`,
      go: () => navigate("/community/patients?tab=new"),
    })),
    ...followups.filter((f) => f.status !== "已完成").map((f) => ({
      id: f.id,
      type: "随访",
      name: f.patients?.name ?? "患者",
      sub: `${f.item}${f.post_discharge_day != null ? ` · 出院 ${f.post_discharge_day} 天` : ""}`,
      go: () => navigate(`/community/chat/patient/${f.patient_id}`),
    })),
    ...uploads.filter((u) => u.status === "已上传").map((u) => ({
      id: u.id,
      type: "上传",
      name: u.patients?.name ?? "患者",
      sub: `${u.note ?? "已上传鼓楼医院"} · 等待医院接收`,
      go: () => navigate(`/community/patients/${u.patient_id}`),
    })),
  ];

  return (
    <div className="space-y-3 p-4">
      <Card className="bg-gradient-community p-4 text-primary-foreground shadow-soft">
        <h2 className="text-base font-semibold">{profile?.full_name ?? "医生"}，早上好 👋</h2>
        <p className="mt-0.5 text-[11px] opacity-90">小市社区认知训练站 · 对接南京市鼓楼医院 · 记忆门诊</p>
      </Card>

      <Card className="p-3 shadow-soft">
        <p className="mb-2 text-sm font-semibold">核心工作</p>
        <div className="grid grid-cols-4 gap-1.5">
          {flow.map((f, i) => (
            <button key={f.label} onClick={() => navigate(f.to)} className="rounded-lg bg-primary/5 px-1 py-2 text-center">
              <p className="text-[10px] text-muted-foreground">{i + 1}</p>
              <p className="text-lg font-bold text-primary">{f.n}</p>
              <p className="text-[10px] text-muted-foreground">{f.unit}</p>
              <p className="mt-0.5 text-[11px] font-medium leading-tight">{f.label}</p>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">进入老人档案可安排小组训练、发放家庭任务、登记执行和随访</p>
      </Card>

      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">今日待办</h3>
        </div>
        <Badge variant="secondary" className="h-5">共 {total} 项</Badge>
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
          <ClipboardCheck className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">今日待办清单</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">共 {taskList.length} 项 · 按优先级</span>
      </div>
      <Card className="overflow-hidden">
        <div className="divide-y">
          {taskList.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">暂无待办</p>}
          {taskList.map((t, i) => (
            <button
              key={t.id}
              onClick={t.go}
              className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${typeStyle[t.type]}`}>{t.type}</span>
                  <span className="text-[13px] font-semibold">{t.name}</span>
                </div>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">{t.sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">在管患者来源</h3>
          <span className="text-[11px] text-muted-foreground">共 {managed.length} 位</span>
        </div>
        <div className="divide-y">
          {managed.map((p) => (
            <div key={p.id} className="flex items-center gap-2 px-4 py-2.5">
              <span className="text-[13px] font-medium">{p.name}</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  p.source === "南京市鼓楼医院" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                }`}
              >
                {sourceLabel(p.source)}
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{p.community_stage}</span>
              {p.abnormal && <span className="ml-auto text-[10px] text-destructive">异常</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CommunityHome;
