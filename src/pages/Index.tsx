import { Link } from "react-router-dom";
import { ArrowRight, Activity, Building2, Stethoscope, Smartphone, ClipboardCheck, MonitorDot } from "lucide-react";
import { Button } from "@/components/ui/button";

const ENDS = [
  {
    to: "/screening", icon: ClipboardCheck, grad: "bg-gradient-nurse", dot: "bg-accent",
    title: "体检中心筛查端", sub: "体检中心筛查人员",
    desc: "核对初筛结果，登记转介和预约",
    items: ["核对 AD-8 初筛结果", "阳性登记转介（训练站 / 记忆门诊）", "登记预约时间"],
  },
  {
    to: "/doctor", icon: Stethoscope, grad: "bg-gradient-doctor", dot: "bg-primary",
    title: "评估医生端", sub: "鼓楼医院记忆门诊 / 评估医生",
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
  <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-secondary/30">
    <header className="container mx-auto flex items-center justify-between py-6">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold">老年认知障碍管理智能体</span>
      </div>
      <span className="text-sm text-muted-foreground">江苏省老年认知训练站</span>
    </header>

    <main className="container mx-auto px-4 pb-16 pt-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">选择您的端</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          体检筛查、评估医生、社区护理康复、家庭与区域管理协同，实现筛查—评估—干预—转诊—随访闭环
        </p>
      </div>

      {/* 管理端 */}
      <Link to="/screen" className="group mx-auto mt-10 flex max-w-6xl flex-col gap-6 overflow-hidden rounded-2xl border bg-card p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant md:flex-row md:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-doctor text-primary-foreground shadow-soft">
          <MonitorDot className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold">区域管理端 · 驾驶舱</h2>
          <p className="mt-2 text-muted-foreground">区域管理人员查看辖区筛查、到院转化、风险分布和随访进展</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {["省级视角", "市级视角", "县(区)级视角"].map((v) => (
              <span key={v} className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">{v}</span>
            ))}
          </div>
        </div>
        <Button size="lg" className="bg-gradient-doctor hover:opacity-90">进入驾驶舱 <ArrowRight className="ml-1 h-4 w-4" /></Button>
      </Link>

      <div className="mx-auto mt-6 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
        {ENDS.map(({ to, icon: I, grad, dot, title, sub, desc, items }) => (
          <Link key={to} to={to} className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant">
            <div className={`absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full ${grad} opacity-10 transition-transform group-hover:scale-150`} />
            <div className="relative flex flex-1 flex-col">
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${grad} text-primary-foreground shadow-soft`}><I className="h-7 w-7" /></div>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-sm text-primary">{sub}</p>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
                {items.map((t) => <li key={t} className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{t}</li>)}
              </ul>
              <Button className={`mt-6 w-full ${grad} hover:opacity-90`}>进入 <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </Link>
        ))}
      </div>
    </main>
  </div>
);

export default Index;
