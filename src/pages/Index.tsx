import { Link } from "react-router-dom";
import { ArrowRight, Activity, Building2, Stethoscope, Smartphone, ClipboardCheck, MonitorDot } from "lucide-react";
import { Button } from "@/components/ui/button";

const ENDS = [
  {
    to: "/doctor", icon: Stethoscope, grad: "bg-gradient-doctor", dot: "bg-primary",
    title: "指导中心端", sub: "医疗端 · 鼓楼医院记忆门诊",
    desc: "接收上转确诊、制定治疗方案、下转并给出诊疗建议",
    items: ["上转患者确诊与疑难会诊", "MMSE / MoCA 复核与诊断", "下转回站并推送诊疗建议"],
  },
  {
    to: "/nurse", icon: ClipboardCheck, grad: "bg-gradient-nurse", dot: "bg-accent",
    title: "训练站端 · 评估师", sub: "评估师 / 治疗管理师",
    desc: "专业量表评估、老年综合评估、个体化训练方案与转诊",
    items: ["MMSE / MoCA / SCD-Q9 / ADL 评估", "睡眠·营养·跌倒·心理综合评估", "训练方案、家庭作业单、上转单"],
  },
  {
    to: "/community", icon: Building2, grad: "bg-gradient-community", dot: "bg-success",
    title: "训练站端 · 站点", sub: "小市社区认知训练站",
    desc: "AD-8 初筛、建档、分级干预、小组训练与随访上报",
    items: ["AD-8 初筛（≥2 分转评估）", "接收下转 5 个工作日内建档", "小组认知训练与月度随访"],
  },
  {
    to: "/patient", icon: Smartphone, grad: "bg-gradient-primary", dot: "bg-primary",
    title: "服务对象端", sub: "老人及家属 / 照护者",
    desc: "查看评估结果、自评老年综合评估、训练打卡与宣教",
    items: ["睡眠·营养·跌倒·心理自评", "家庭训练作业与打卡", "复评提醒与联系训练站"],
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
          管理端、指导中心端、训练站端、服务对象端协同，实现筛查—评估—干预—转诊—随访全周期闭环
        </p>
      </div>

      {/* 管理端 */}
      <Link to="/screen" className="group mx-auto mt-10 flex max-w-6xl flex-col gap-6 overflow-hidden rounded-2xl border bg-card p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant md:flex-row md:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-doctor text-primary-foreground shadow-soft">
          <MonitorDot className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold">管理端 · 监管驾驶舱</h2>
          <p className="mt-2 text-muted-foreground">各级卫生健康部门监管大屏：站点建设、筛查覆盖、干预指导、转诊与效果评估</p>
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
