import { Link } from "react-router-dom";
import { ArrowRight, Activity, Building2, Stethoscope, Smartphone, MonitorDot } from "lucide-react";
import { Button } from "@/components/ui/button";

const ENDS = [
  {
    to: "/doctor", icon: Stethoscope, grad: "bg-gradient-doctor", dot: "bg-primary",
    title: "医生端", sub: "鼓楼医院记忆门诊 / 评估医生",
    desc: "查看量表与智能体初步风险等级，确认分级、转诊与方案",
    items: ["查看 MMSE / MoCA 等量表结果", "确认风险分级、是否转诊", "制定并调整后续方案"],
  },
  {
    to: "/community", icon: Building2, grad: "bg-gradient-community", dot: "bg-success",
    title: "社区护理康复端", sub: "社区护士 / 康复治疗人员",
    desc: "承接患者、安排训练、发放家庭任务、记录执行和随访",
    items: ["承接转介患者并建档", "安排小组训练与家庭任务", "记录执行情况与随访"],
  },
  {
    to: "/patient", icon: Smartphone, grad: "bg-gradient-primary", dot: "bg-primary",
    title: "家庭端", sub: "老人或获授权的家属",
    desc: "查看安排、完成自评、执行家庭任务并提交反馈",
    items: ["查看训练与复评安排", "完成自评（记录本人或家属协助）", "执行家庭任务并反馈"],
  },
];

const Index = () => (
  <div className="min-h-screen bg-background">
    <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-b px-6 py-5">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold">老年认知障碍管理智能体</span>
      </div>
      <span className="text-sm text-muted-foreground">江苏省老年认知训练站</span>
    </header>

    <main className="mx-auto max-w-7xl px-6 pb-12 pt-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold">工作入口</h1>
        <span className="text-sm text-muted-foreground">老年认知健康协同服务</span>
      </div>

      {/* 管理端 */}
      <section className="grid gap-5 md:grid-cols-3">
        {ENDS.map(({ to, icon: I, grad, title, sub, items }) => (
          <article key={to} className="flex min-w-0 flex-col rounded-lg border bg-card p-6 shadow-soft">
            <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-lg ${grad} text-primary-foreground`}><I className="h-7 w-7" /></div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-2 min-h-14 text-sm text-muted-foreground">{sub}</p>
            <ul className="mt-4 flex-1 space-y-3 border-t pt-4 text-sm text-muted-foreground">{items.map(t => <li key={t}>{t}</li>)}</ul>
            <Button asChild className={`mt-7 w-full ${grad} hover:opacity-90`}><Link to={to}>进入{title}<ArrowRight className="ml-auto h-4 w-4" /></Link></Button>
          </article>
        ))}
      </section>
      <section className="mt-8 flex flex-col gap-5 border-y py-7 md:flex-row md:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-doctor text-primary-foreground shadow-soft">
          <MonitorDot className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold">区域管理端 · 驾驶舱</h2>
          <p className="mt-2 text-sm text-muted-foreground">辖区筛查 · 到院转化 · 风险分布 · 随访进展</p>
        </div>
        <div className="flex flex-wrap gap-2">{[{label:"省级",level:"province"},{label:"市级",level:"city"},{label:"县（区）级",level:"county"}].map(v => <Button key={v.level} asChild variant={v.level === "province" ? "default" : "outline"}><Link to={`/screen?level=${v.level}`}>{v.label}驾驶舱<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>)}</div>
      </section>
    </main>
  </div>
);

export default Index;
