import { Link, useNavigate } from "react-router-dom";
import { Users, ClipboardCheck, CalendarClock, Bell } from "lucide-react";
import { planConfirmed, needsReferral } from "@/data/cognitive";
import { Button } from "@/components/ui/button";
import { doctorReceptionQueue } from "@/data/doctorReception";
import { referralApprovalQueue } from "@/data/referralApproval";
import {
  usePatients,
  useReferrals,
  useMyProfile,
} from "@/data/patients";

function hourGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "凌晨好";
  if (h < 12) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
}

const DoctorHome = () => {
  const navigate = useNavigate();
  const { data: patients = [] } = usePatients("all");
  const reviews = patients.filter((p) => needsReferral(p.cognitive_risk) && !planConfirmed(p));
  const { data: profile } = useMyProfile();
  const { data: referrals = [] } = useReferrals();
  const upQueue = doctorReceptionQueue(referrals);

  const pendingReviews = reviews.length;

  // 待办直接来自方案审核队列：审核中的每一条都是一件真实的待处理事项。
  const todoList = [
    ...referralApprovalQueue(referrals).map(r => ({
      id: `approval-${r.id}`, type: "审核" as const,
      title: `${r.patients?.name ?? "患者"} · 转诊申请待审批`,
      time: r.created_at.slice(0, 10), to: `/doctor/patients/${r.patient_id}`,
    })),
    ...upQueue.map((r) => ({
      id: r.id,
      type: "审核" as const,
      title: `${r.patients?.name ?? "患者"} · 转诊待接收（${r.from_hospital}）`,
      time: r.created_at.slice(5, 16).replace("T", " "),
      to: `/doctor/patients/${r.patient_id}`,
    })),
    ...reviews.slice(0, 5).map((p) => ({
      id: p.id,
      type: "审核" as const,
      title: `${p.name} · ${p.cognitive_risk}治疗方案待确认`,
      time: p.ai_plan_at ? new Date(p.ai_plan_at).toLocaleDateString("zh-CN") : "待生成 AI 方案",
      to: `/doctor/plans/${p.id}`,
    })),
  ];

  const todoCount = todoList.length;
  const greetingName = profile?.full_name ?? "医生";

  return (
    <div className="space-y-3 px-4 py-4">
      <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60">
        <h2 className="text-xl font-semibold text-foreground">
          {greetingName}，{hourGreeting()}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          今日有 <span className="font-medium text-foreground">{todoCount}</span> 项待处理事项，
          <span className="text-primary">{profile?.department ?? "记忆门诊"} · 认知管理</span>
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <TileCard
          to="/doctor/patients"
          icon={<Users className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          num={patients.length}
          label="患者档案"
          dot
        />
        <TileCard
          to="/doctor/plans"
          icon={<ClipboardCheck className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-500/15"
          num={pendingReviews}
          label="中高风险治疗方案确认"
          dot
        />
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Bell className="h-4 w-4 text-primary" />
            今日待办
          </h3>
          <span className="text-xs text-muted-foreground">{todoList.length} 项</span>
        </div>
        <ul className="divide-y divide-border">
          {todoList.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">暂无待办</li>}
          {todoList.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-2.5">
              <TodoBadge type={t.type} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3 w-3" />
                  {t.time}
                </p>
              </div>
              <Button size="sm" variant="outline"
                onClick={() => navigate(t.to)}
                className="whitespace-nowrap rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary"
              >
                处理
              </Button>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
};

function TileCard({ to, icon, iconBg, num, label, dot }: { to: string; icon: React.ReactNode; iconBg: string; num: number; label: string; dot?: boolean }) {
  return (
    <Link to={to} className="block rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
      <div className="relative inline-flex">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
        {dot ? <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive" /> : null}
      </div>
      <p className="mt-3 text-2xl font-semibold">{num}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </Link>
  );
}

function TodoBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    审核: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    回复: "bg-primary/10 text-primary",
    会诊: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  };
  return (
    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${map[type] ?? "bg-muted text-muted-foreground"}`}>
      {type}
    </span>
  );
}

export default DoctorHome;
