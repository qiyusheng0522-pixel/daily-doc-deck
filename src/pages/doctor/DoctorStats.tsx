import { doctor, doctorPatients, planReviews, chats, monthlyRevenue } from "@/data/doctorMock";
import { Users, ClipboardCheck, MessageSquare, Wallet, TrendingUp, TrendingDown, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, BadgeCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const DoctorStats = () => {
  const navigate = useNavigate();

  const workload = [
    { label: "在管患者", value: doctorPatients.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "本月方案", value: planReviews.length, icon: ClipboardCheck, color: "text-amber-600", bg: "bg-amber-500/15" },
    { label: "沟通对话", value: chats.length, icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-500/15" },
  ];

  const outcomes = [
    { label: "血压达标率", value: 72, delta: "+8%", up: true },
    { label: "LDL 达标率", value: 65, delta: "+5%", up: true },
    { label: "服药依从性", value: 84, delta: "+3%", up: true },
    { label: "3 月内复发率", value: 4, delta: "-1.2%", up: false, invert: true },
  ];

  const revenueBreakdown = [
    { label: "沟通咨询", value: 3280, pct: 60, cls: "bg-primary" },
    { label: "方案确认", value: 1360, pct: 25, cls: "bg-amber-500" },
    { label: "会诊分成", value: 820, pct: 15, cls: "bg-violet-500" },
  ];
  const revenueTotal = revenueBreakdown.reduce((s, r) => s + r.value, 0);

  const bars = [12, 18, 14, 22, 26, 20, 28];

  const settings = [
    { icon: BadgeCheck, label: "执业认证", value: "已认证", action: () => toast({ title: "执业认证", description: "您的资质已通过审核" }) },
    { icon: Bell, label: "消息通知", value: "已开启", action: () => toast({ title: "消息通知设置" }) },
    { icon: Shield, label: "账号与安全", action: () => toast({ title: "账号与安全", description: "修改密码 / 绑定手机" }) },
    { icon: Settings, label: "偏好设置", action: () => toast({ title: "偏好设置" }) },
    { icon: HelpCircle, label: "帮助与反馈", action: () => toast({ title: "帮助与反馈" }) },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "已退出登录" });
    navigate("/auth");
  };

  return (
    <div className="space-y-3 px-4 py-3">
      {/* 个人信息 */}
      <section className="rounded-2xl bg-gradient-primary p-4 text-primary-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
            {doctor.initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold">{doctor.name}</p>
            <p className="mt-0.5 whitespace-nowrap text-[11px] opacity-90">神经内科 · 主任医师 · 工号 D0821</p>
            <p className="mt-0.5 text-[11px] opacity-80">南京市鼓楼医院</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/20 pt-3 text-center">
          <div>
            <p className="text-[10px] opacity-80">在管患者</p>
            <p className="mt-0.5 text-base font-bold">{doctorPatients.length}</p>
          </div>
          <div>
            <p className="text-[10px] opacity-80">本月方案</p>
            <p className="mt-0.5 text-base font-bold">{planReviews.length}</p>
          </div>
          <div>
            <p className="text-[10px] opacity-80">好评率</p>
            <p className="mt-0.5 text-base font-bold">99%</p>
          </div>
        </div>
      </section>

      {/* 工作量 */}
      <section className="grid grid-cols-3 gap-3">
        {workload.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className={`mt-3 text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
        <h3 className="mb-3 text-sm font-semibold">近 7 天工作量</h3>
        <div className="flex h-40 items-end justify-between gap-2">
          {bars.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${(v / 30) * 100}%` }} />
              <span className="text-[10px] text-muted-foreground">
                {["一", "二", "三", "四", "五", "六", "日"][i]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
        <h3 className="mb-3 text-sm font-semibold">治疗成效</h3>
        <ul className="space-y-3">
          {outcomes.map((o) => (
            <li key={o.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-foreground">{o.label}</span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{o.value}%</span>
                  <span className="inline-flex items-center gap-0.5 whitespace-nowrap rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-400">
                    {o.invert ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {o.delta}
                  </span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${o.invert ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${Math.min(o.value, 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Wallet className="h-4 w-4 text-emerald-600" />
            {monthlyRevenue.label} · 明细
          </h3>
          <span className="whitespace-nowrap text-xs text-muted-foreground">总计 ¥{revenueTotal.toLocaleString()}</span>
        </div>
        <ul className="space-y-3">
          {revenueBreakdown.map((r) => (
            <li key={r.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-foreground">{r.label}</span>
                <span className="whitespace-nowrap text-muted-foreground">¥{r.value.toLocaleString()} · {r.pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${r.cls}`} style={{ width: `${r.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <MiniStat label="已结算" value={`¥${(revenueTotal * 0.7).toFixed(0)}`} />
          <MiniStat label="待结算" value={`¥${(revenueTotal * 0.3).toFixed(0)}`} />
        </div>
      </section>

      {/* 账号设置 */}
      <section className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60">
        <div className="divide-y divide-border">
          {settings.map((s) => (
            <button
              key={s.label}
              onClick={s.action}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <s.icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 whitespace-nowrap text-sm">{s.label}</span>
              {s.value && <span className="whitespace-nowrap text-xs text-muted-foreground">{s.value}</span>}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-3 text-sm font-medium text-destructive shadow-sm ring-1 ring-border/60"
      >
        <LogOut className="h-4 w-4" />
        退出登录
      </button>
    </div>
  );
};

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 py-2 text-center">
      <p className="whitespace-nowrap font-semibold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default DoctorStats;
