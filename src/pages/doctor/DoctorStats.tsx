import { doctor } from "@/data/doctorMock";
import { Users, ClipboardCheck, TrendingUp, TrendingDown, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePatients, useReferrals } from "@/data/patients";
import { doctorServiceStats } from "@/data/doctorServiceStats";

const DoctorStats = () => {
  const navigate = useNavigate();
  const patients = usePatients("all");
  const referrals = useReferrals();
  const stats = doctorServiceStats(patients.data ?? [], referrals.data ?? []);
  const ready = patients.isSuccess && referrals.isSuccess;

  const workload = [
    { label: "在管患者", value: ready ? stats.managedCount : "—", icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "下转患者", value: ready ? `${stats.referredCount} 人` : "—", icon: ClipboardCheck, color: "text-amber-600", bg: "bg-amber-500/15" },
  ];

  const outcomes = [
    { label: "MMSE 改善率", value: 72, delta: "+8%", up: true },
    { label: "训练任务完成率", value: 65, delta: "+5%", up: true },
    { label: "随访完成率", value: 84, delta: "+3%", up: true },
    { label: "3 月内进展率", value: 4, delta: "-1.2%", up: false, invert: true },
  ];

  const bars = [12, 18, 14, 22, 26, 20, 28];

  const settings = [
    { icon: Bell, label: "消息通知", value: "已开启", action: () => toast({ title: "消息通知设置" }) },
    { icon: Shield, label: "账号与安全", action: () => toast({ title: "账号与安全", description: "修改密码 / 绑定手机" }) },
    { icon: Settings, label: "偏好设置", action: () => toast({ title: "偏好设置" }) },
    { icon: HelpCircle, label: "帮助与反馈", action: () => toast({ title: "帮助与反馈" }) },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return toast({ title: "退出失败，请重试" });
    toast({ title: "已退出登录" });
    navigate("/auth");
  };

  return (
    <div className="space-y-3 px-4 py-3">
      {/* 个人信息 */}
      <section className="rounded-2xl bg-gradient-primary p-4 text-primary-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20 text-xl font-bold">
            {doctor.initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold">{doctor.name}</p>
            <p className="mt-0.5 whitespace-nowrap text-[15.4px] opacity-90">评估医生 · 记忆门诊</p>
            <p className="mt-0.5 text-[15.4px] opacity-80">南京市鼓楼医院 · 演示账号</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-primary-foreground/20 pt-3 text-center">
          <div>
            <p className="text-[14px] opacity-80">在管患者</p>
            <p className="mt-0.5 text-base font-bold">{ready ? stats.managedCount : "—"}</p>
          </div>
          <div>
            <p className="text-[14px] opacity-80">转诊率</p>
            <p className="mt-0.5 text-base font-bold">{ready && stats.referralRate !== null ? `${stats.referralRate}%` : "—"}</p>
          </div>
        </div>
        <p className="mt-2 text-[14px] opacity-70">统计口径：有下转记录的在管患者人数 ÷ 在管患者人数，同一患者不重复计算。</p>
        {(patients.isError || referrals.isError) && <p className="mt-1 text-[14px]">统计读取失败，请稍后重试</p>}
      </section>

      {/* 工作量 */}
      <section className="grid grid-cols-2 gap-3">
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
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${(v / 30) * 100}%` }} />
              <span className="text-[14px] text-muted-foreground">
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
                  <span className="inline-flex items-center gap-0.5 whitespace-nowrap rounded bg-emerald-500/15 px-1.5 py-0.5 text-[14px] text-emerald-700 dark:text-emerald-400">
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

export default DoctorStats;
