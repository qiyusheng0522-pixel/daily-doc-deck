import { Link, useNavigate } from "react-router-dom";
import { doctor, doctorPatients, todos, planReviews, chats, monthlyRevenue } from "@/data/doctorMock";
import { Users, MessageSquare, ClipboardCheck, Wallet, CalendarClock, Bell } from "lucide-react";

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
  const totalPatients = doctorPatients.length;
  const pendingReviews = planReviews.filter((r) => r.status === "审核中").length;
  const unread = chats.reduce((s, c) => s + c.unread, 0);
  const todoCount = todos.length;

  const handleTodo = (t: typeof todos[number]) => {
    const p = doctorPatients.find((x) => x.name === t.patient);
    if (t.type === "审核") navigate("/doctor/plans");
    else if (t.type === "回复") navigate(p ? `/doctor/chat/${p.id}` : "/doctor/communication");
    else if (t.type === "会诊") navigate(p ? `/doctor/patients/${p.id}` : "/doctor/patients");
    else navigate("/doctor/patients");
  };

  return (
    <div className="space-y-3 px-4 py-4">
      <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60">
        <h2 className="text-xl font-semibold text-foreground">
          {doctor.name}，{hourGreeting()}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          今日有 <span className="font-medium text-foreground">{todoCount}</span> 项待处理事项，
          <span className="text-primary">神经内科 · 卒中管理</span>
        </p>
      </section>

      <section className="grid grid-cols-3 divide-x divide-border rounded-2xl bg-card py-5 shadow-sm ring-1 ring-border/60">
        <KpiCell num={totalPatients} label="患者" color="text-primary" />
        <KpiCell num={unread} label="未读消息" color="text-destructive" />
        <KpiCell num={pendingReviews} label="待审核" color="text-amber-600" />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <TileCard
          to="/doctor/patients"
          icon={<Users className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          num={totalPatients}
          label={`患者 · 在期 ${doctorPatients.filter((p) => p.status !== "过期").length}`}
          dot
        />
        <TileCard
          to="/doctor/plans"
          icon={<ClipboardCheck className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-500/15"
          num={pendingReviews}
          label={`方案审核 · 共 ${planReviews.length} 条`}
          dot
        />
        <TileCard
          to="/doctor/communication"
          icon={<MessageSquare className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-500/15"
          num={unread}
          label={`待回复 · ${unread} 条未读`}
          dot={unread > 0}
        />
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Bell className="h-4 w-4 text-primary" />
            今日待办
          </h3>
          <span className="text-xs text-muted-foreground">{todos.length} 项</span>
        </div>
        <ul className="divide-y divide-border">
          {todos.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-2.5">
              <TodoBadge type={t.type} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3 w-3" />
                  {t.time}
                </p>
              </div>
              <button onClick={() => handleTodo(t)} className="whitespace-nowrap rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary">
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
            {monthlyRevenue.label}
          </h3>
          <span className="text-xs text-muted-foreground">
            已完成 {monthlyRevenue.completed} 单 · 待结算 ¥{monthlyRevenue.pending}
          </span>
        </div>
        <p className="mt-2 text-3xl font-semibold text-emerald-600">
          ¥{monthlyRevenue.total.toLocaleString()}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <MiniStat label="沟通咨询" value="¥0" />
          <MiniStat label="方案确认" value="¥0" />
          <MiniStat label="会诊分成" value="¥0" />
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
