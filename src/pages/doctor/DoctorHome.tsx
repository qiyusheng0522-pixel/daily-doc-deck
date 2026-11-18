import { Link, useNavigate } from "react-router-dom";
import { Users, ClipboardCheck, Wallet, CalendarClock, Bell } from "lucide-react";
import {
  usePatients,
  usePlanReviews,
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
  const { data: reviews = [] } = usePlanReviews();
  const { data: profile } = useMyProfile();
  const { data: referrals = [] } = useReferrals();
  const upQueue = referrals.filter((r) => r.direction === "上转" && r.status === "待接收");

  const pendingReviews = reviews.filter((r) => r.status === "审核中").length;
  const activePatients = patients.filter((p) => p.hospital_stage !== "历史").length;

  // 待办直接来自方案审核队列：审核中的每一条都是一件真实的待处理事项。
  const todoList = [
    ...upQueue.map((r) => ({
      id: r.id,
      type: "审核" as const,
      title: `${r.patients?.name ?? "患者"} · 上转待确诊（${r.from_hospital}）`,
      time: r.created_at.slice(5, 16).replace("T", " "),
      to: `/doctor/patients/${r.patient_id}`,
    })),
    ...reviews
    .filter((r) => r.status === "审核中")
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      type: "审核" as const,
      title: `${r.patients?.name ?? "患者"} · ${r.category}审核`,
      time: r.submitted_at.slice(5, 16).replace("T", " "),
      to: `/doctor/plans`,
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

      <section className="grid grid-cols-3 divide-x divide-border rounded-2xl bg-card py-5 shadow-sm ring-1 ring-border/60">
        <KpiCell num={patients.length} label="患者" color="text-primary" />
        <KpiCell num={activePatients} label="在期" color="text-emerald-600" />
        <KpiCell num={upQueue.length} label="待确诊" color="text-amber-600" />
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
        <p className="mb-2 text-sm font-semibold">指导中心职责</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { t: "确诊", d: "记忆门诊 / 神经内科 / 老年医学科", n: upQueue.length, u: "待确诊", to: upQueue[0] ? `/doctor/patients/${upQueue[0].patient_id}` : "/doctor/patients" },
            { t: "接诊确认并反馈", d: "上转接诊，反馈指导意见", n: upQueue.length, u: "待接诊", to: upQueue[0] ? `/doctor/patients/${upQueue[0].patient_id}` : "/doctor/patients" },
            { t: "下转并给诊疗建议", d: "下转社区训练站或县级龙头医院", n: referrals.filter((r) => r.direction === "下转").length, u: "已下转", to: "/doctor/patients" },
            { t: "技术与方案支撑", d: "审核模型方案，量表评估", n: patients.filter((p) => p.ai_plan && !p.ai_plan_confirmed_at && (p.cognitive_risk === "中风险" || p.cognitive_risk === "高风险")).length, u: "待确认方案", to: "/doctor/plans" },
          ].map((x) => (
            <button key={x.t} onClick={() => navigate(x.to)} className="rounded-xl bg-primary/5 p-2.5 text-left">
              <p className="font-semibold">{x.t}</p>
              <p className="text-[10px] text-muted-foreground">{x.d}</p>
              <p className="mt-1"><span className="text-base font-bold text-primary">{x.n}</span> <span className="text-[10px] text-muted-foreground">{x.u}</span></p>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">县级龙头医院承接部分市级下转患者的接续管理（下转时可选择）</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <TileCard
          to="/doctor/patients"
          icon={<Users className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          num={patients.length}
          label={`患者 · 在期 ${activePatients}`}
          dot
        />
        <TileCard
          to="/doctor/plans"
          icon={<ClipboardCheck className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-500/15"
          num={pendingReviews}
          label={`方案审核 · 共 ${reviews.length} 条`}
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
              <button
                onClick={() => navigate(t.to)}
                className="whitespace-nowrap rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary"
              >
                处理
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Wallet className="h-4 w-4 text-emerald-600" />
            本月服务量
          </h3>
          <span className="text-xs text-muted-foreground">
            已接收下转 {patients.filter((p) => p.community_stage !== null).length} 例 · 待审核 {pendingReviews} 条
          </span>
        </div>
        <p className="mt-2 text-3xl font-semibold text-emerald-600">{patients.length}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <MiniStat label="在管患者" value={String(activePatients)} />
          <MiniStat label="来源渠道" value={`${new Set(patients.map((p) => p.source)).size} 个`} />
          <MiniStat label="异常提示" value={String(patients.filter((p) => p.abnormal).length)} />
        </div>
      </section>
    </div>
  );
};

function KpiCell({ num, label, color }: { num: number | string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-3xl font-semibold ${color}`}>{num}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 py-2">
      <p className="font-semibold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default DoctorHome;
