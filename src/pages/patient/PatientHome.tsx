import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera,
  Brain,
  BookOpen,
  ChevronRight,
  Activity,
  Sparkles,
  Stethoscope,
  Bell,
  Droplet,
  HeartPulse,
  Pill,
  ClipboardList,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Mic,
  Plus,
  Clock,
  Utensils,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import FamilyTasks from "@/components/patient/FamilyTasks";

const STORAGE_KEY = "patient-guide-step-v1";
const GUIDE_SEEN_KEY = "patient-guide-seen-v1";

const guideSteps = [
  { key: "upload", title: "第 1 步 · 档案上传", desc: "拍照上传出院小结/病历,OCR 自动识别", cta: "去拍照", icon: Camera, to: "/patient/archive" },
  { key: "assess", title: "第 2 步 · 风险评估", desc: "完成睡眠、营养、跌倒与心理自评", cta: "去填写", icon: ClipboardList, to: "/patient/assessment" },
  { key: "plan", title: "第 3 步 · 查看方案", desc: "查看专属健康方案,开启每日打卡", cta: "去查看", icon: FileText, to: "/patient/plan" },
];

const PatientHome = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(() => {
    const v = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(v) && v >= 0 ? v : 0;
  });
  const [expanded, setExpanded] = useState(() => {
    const seen = localStorage.getItem(GUIDE_SEEN_KEY);
    if (!seen) {
      localStorage.setItem(GUIDE_SEEN_KEY, "1");
      return true;
    }
    return false;
  });
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMountEl(document.querySelector<HTMLElement>("[data-patient-frame]"));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(step));
  }, [step]);

  const handleStepAction = () => {
    const target = guideSteps[step]?.to;
    if (target) navigate(target);
  };

  const done = step >= guideSteps.length;
  const current = guideSteps[Math.min(step, guideSteps.length - 1)];
  const CurrentIcon = current.icon;

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-5 text-primary-foreground shadow-lg">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Camera className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xl font-semibold">拍照录入档案</p>
            <p className="text-sm opacity-90">智能 OCR 自动识别</p>
          </div>
        </div>
        <p className="mb-4 text-base leading-relaxed opacity-95">
          出院小结、检验报告、体检材料,拍一拍即可建立您的认知健康档案。
        </p>
        <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90">
          <Camera className="mr-2 h-5 w-5" /> 立即拍照录入
        </Button>
      </div>

      {/* 咨询医生 + 消息 拆分 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate("/patient/doctors")}
          className="flex items-center gap-2 rounded-xl border bg-card p-3 text-left shadow-sm"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">咨询医生</p>
            <p className="mt-0.5 text-[15.4px] text-muted-foreground">医生 / 健康管理师 1v1</p>
          </div>
        </button>
        <button
          onClick={() => toast({ title: "消息中心", description: "3 条未读" })}
          className="flex items-center gap-2 rounded-xl border bg-card p-3 text-left shadow-sm"
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[12.6px] font-bold text-destructive-foreground">
              3
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">消息</p>
            <p className="mt-0.5 text-[15.4px] text-muted-foreground">3 条未读 · 随访 / 提醒</p>
          </div>
        </button>
      </div>

      {/* 三项指标 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border bg-card p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <HeartPulse className="h-3.5 w-3.5" /> 血压
          </div>
          <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            128<span className="ml-0.5 text-sm font-medium text-muted-foreground">/82</span>
          </p>
          <p className="text-[15.4px] text-muted-foreground">mmHg · 达标</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Droplet className="h-3.5 w-3.5" /> 空腹血糖
          </div>
          <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">5.6</p>
          <p className="text-[15.4px] text-muted-foreground">mmol/L · 平稳</p>
        </div>

      </div>

      {/* 四个入口 */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Camera, label: "AI 建档", color: "text-sky-600 bg-sky-50 dark:bg-sky-900/40 dark:text-sky-300", to: "/patient/archive" },
          { icon: ClipboardList, label: "评估问卷", color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/40 dark:text-cyan-300", to: "/patient/assessment" },
          { icon: FileText, label: "今日任务", color: "text-violet-600 bg-violet-50 dark:bg-violet-900/40 dark:text-violet-300", to: "/patient/tasks" },
          { icon: Droplet, label: "数据录入", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 dark:text-emerald-300", to: "/patient/data" },
        ].map((q) => {
          const Icon = q.icon;
          const inner = (
            <div className={`flex flex-col items-center gap-1.5 rounded-xl p-3 ${q.color}`}>
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium">{q.label}</span>
            </div>
          );
          return q.to ? (
            <Link key={q.label} to={q.to}>{inner}</Link>
          ) : (
            <button key={q.label} onClick={() => toast({ title: q.label, description: "功能即将开放" })}>
              {inner}
            </button>
          );
        })}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">今日任务</h2><Button variant="ghost" size="sm" onClick={() => navigate("/patient/tasks")}>全部 <ChevronRight className="h-4 w-4" /></Button></div>
        <FamilyTasks compact />
      </section>

      {/* 认知评估量表 */}
      <div>
        <h2 className="mb-2 px-1 text-lg font-semibold">认知评估量表</h2>
        <Link
          to="/patient/assessment"
          className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-sky-50 to-cyan-50 p-4 dark:from-sky-950/40 dark:to-cyan-950/40"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="min-w-0 text-base font-semibold">老年综合评估自评</p>
              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[15.4px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                已填写
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">睡眠 · 营养 · 跌倒风险 · 精神心理</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      </div>

      {/* 健康宣教 */}
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="flex items-center gap-1.5 text-lg font-semibold">
            <BookOpen className="h-5 w-5" /> 健康宣教
          </h2>
          <button className="flex items-center text-sm text-muted-foreground">
            更多 <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {[
            { title: "认知功能变化的早期信号", tag: "科普", read: "3 min" },
            { title: "居家认知训练怎么做", tag: "康复", read: "6 min" },
            { title: "规律睡眠与均衡营养", tag: "健康", read: "4 min" },
          ].map((a) => (
            <div key={a.title} className="flex items-center gap-3 rounded-xl border bg-card p-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-base font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.tag} · {a.read}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pb-2 text-center text-xs text-muted-foreground">
        <Activity className="mr-1 inline h-3 w-3" /> 数据同步自 南京市鼓楼医院 · 记忆门诊
      </div>

      {/* 悬浮使用引导 */}
      {!done && mountEl && createPortal(
        <div className="pointer-events-none absolute inset-x-3 bottom-24 z-50 flex justify-center">
          <div className="pointer-events-auto w-full rounded-2xl border border-primary/30 bg-card/95 shadow-2xl backdrop-blur">
            <div
              className="flex cursor-pointer items-center justify-between rounded-t-2xl bg-gradient-primary px-4 py-2.5 text-primary-foreground"
              onClick={() => setExpanded((v) => !v)}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-semibold">使用引导</p>
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-[14px]">
                  {step}/{guideSteps.length}
                </span>
              </div>
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </div>

            {expanded && (
              <div className="p-4">
                {/* 步骤条:每段连接线等宽,圆点居中对齐 */}
                <div className="mb-4 flex items-center">
                  {guideSteps.map((s, i) => {
                    const isDone = i < step;
                    const isCurrent = i === step;
                    return (
                      <div key={s.key} className="flex flex-1 items-center last:flex-none">
                        <button
                          type="button"
                          aria-label={`步骤 ${i + 1}`}
                          onClick={() => setStep(i)}
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[15.4px] font-semibold ${
                            isDone
                              ? "bg-emerald-500 text-white"
                              : isCurrent
                              ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                        </button>
                        {i < guideSteps.length - 1 && (
                          <div className={`mx-2 h-0.5 flex-1 rounded ${i < step ? "bg-emerald-500" : "bg-muted"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex w-full items-center gap-3 rounded-xl bg-primary/5 p-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <CurrentIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{current.title}</p>
                    <p className="mt-0.5 text-[15.4px] text-muted-foreground">{current.desc}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => setStep(guideSteps.length)}>
                    跳过引导
                  </Button>
                  <Button size="sm" className="bg-gradient-primary text-xs" onClick={handleStepAction}>
                    {current.cta} <ChevronRight className="ml-0.5 h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>,
        mountEl
      )}
    </div>
  );
};

export default PatientHome;
