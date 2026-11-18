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
import PatientActionSheet from "@/components/patient/PatientActionSheet";

const STORAGE_KEY = "patient-guide-step-v1";
const GUIDE_SEEN_KEY = "patient-guide-seen-v1";

const guideSteps = [
  { key: "upload", title: "第 1 步 · 档案上传", desc: "拍照上传出院小结/病历,OCR 自动识别", cta: "去拍照", icon: Camera, to: "/patient/archive" },
  { key: "assess", title: "第 2 步 · 风险评估", desc: "填写认知量表,评估复发风险", cta: "去填写", icon: ClipboardList, to: "/patient/assessment" },
  { key: "plan", title: "第 3 步 · 查看方案", desc: "查看专属健康方案,开启每日打卡", cta: "去查看", icon: FileText, to: "/patient/plan" },
];

type TaskType = "med" | "diet" | "exercise" | "bp";

type Task = {
  id: string;
  type: TaskType;
  title: string;
  desc: string;
  icon: typeof Pill;
  color: string;
  actionLabel: string; // 记录 / 打卡 / 确认
  doneLabel: string;   // 已记录 / 已打卡
  done?: boolean;
};

const initialTasks: Task[] = [
  {
    id: "t-med",
    type: "med",
    title: "用药 · 阿司匹林肠溶片",
    desc: "10:30 · 餐后服用 · +20 积分",
    icon: Pill,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
    actionLabel: "记录",
    doneLabel: "已记录",
  },
  {
    id: "t-bp",
    type: "bp",
    title: "血压监测 · 晨起",
    desc: "已完成 · +10 积分",
    icon: HeartPulse,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
    actionLabel: "记录",
    doneLabel: "已记录",
    done: true,
  },
  {
    id: "t-diet",
    type: "diet",
    title: "饮食 · 午餐打卡",
    desc: "推荐:糙米饭 + 清蒸鲈鱼 · +15 积分",
    icon: Utensils,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
    actionLabel: "打卡",
    doneLabel: "已打卡",
  },
  {
    id: "t-ex",
    type: "exercise",
    title: "康复训练 · 15 分钟",
    desc: "18:00 · 手部精细动作 · +30 积分",
    icon: Dumbbell,
    color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300",
    actionLabel: "记录",
    doneLabel: "已记录",
  },
];

const dietPlan7d = [
  { day: "周一 07/15", breakfast: "燕麦南瓜粥 + 水煮蛋", lunch: "糙米饭 + 清蒸鲈鱼 + 西兰花", dinner: "红薯 + 番茄豆腐汤" },
  { day: "周二 07/16", breakfast: "小米粥 + 蒸山药", lunch: "藜麦饭 + 白灼虾 + 芦笋", dinner: "杂粮饭 + 清炖鸡" },
  { day: "周三 07/17", breakfast: "全麦面包 + 牛奶", lunch: "糙米饭 + 香煎三文鱼 + 时蔬", dinner: "紫薯 + 冬瓜排骨汤" },
  { day: "周四 07/18", breakfast: "杂粮粥 + 水煮蛋", lunch: "藜麦沙拉 + 鸡胸肉", dinner: "山药 + 蘑菇豆腐汤" },
  { day: "周五 07/19", breakfast: "燕麦牛奶 + 蓝莓", lunch: "糙米饭 + 清蒸鲈鱼 + 菠菜", dinner: "红薯 + 冬瓜虾仁汤" },
  { day: "周六 07/20", breakfast: "小米粥 + 蒸蛋", lunch: "全麦面 + 番茄鸡蛋", dinner: "杂粮饭 + 木耳鸡丝" },
  { day: "周日 07/21", breakfast: "南瓜粥 + 全麦馒头", lunch: "糙米饭 + 蒸鲳鱼 + 时蔬", dinner: "紫薯 + 白菜豆腐汤" },
];

const medPlan = [
  { name: "阿司匹林肠溶片", dose: "100mg", times: ["10:30 早餐后"], note: "抗血小板 · 长期服用" },
  { name: "阿托伐他汀钙片", dose: "40mg", times: ["21:00 睡前"], note: "调脂稳定斑块" },
  { name: "苯磺酸氨氯地平", dose: "5mg", times: ["08:00 早餐前"], note: "降压 · 目标 <140/90" },
];

const exerciseSessions = [
  { name: "手部精细动作训练", duration: 15, intensity: "轻度", desc: "抓握、捏取、拧毛巾等,恢复上肢协调" },
  { name: "坐位平衡训练", duration: 10, intensity: "轻度", desc: "坐位重心转移,配合上肢伸展" },
  { name: "步行训练", duration: 20, intensity: "中度", desc: "室内平地慢走,注意保持步态" },
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
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [openTask, setOpenTask] = useState<Task | null>(null);

  // exercise sheet state
  const [exMinutes, setExMinutes] = useState(15);
  const [exFeel, setExFeel] = useState<string>("刚好");

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

  const markDone = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: true } : t)));
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
          出院小结、检验报告、用药清单,拍一拍即可建立您的认知健康档案。
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
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">医生 / 健康管理师 1v1</p>
          </div>
        </button>
        <button
          onClick={() => toast({ title: "消息中心", description: "3 条未读" })}
          className="flex items-center gap-2 rounded-xl border bg-card p-3 text-left shadow-sm"
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
              3
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">消息</p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">3 条未读 · 随访 / 提醒</p>
          </div>
        </button>
      </div>

      {/* 三项指标 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border bg-card p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <HeartPulse className="h-3.5 w-3.5" /> 血压
          </div>
          <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            128<span className="ml-0.5 text-sm font-medium text-muted-foreground">/82</span>
          </p>
          <p className="text-[11px] text-muted-foreground">mmHg · 达标</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Droplet className="h-3.5 w-3.5" /> 空腹血糖
          </div>
          <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">5.6</p>
          <p className="text-[11px] text-muted-foreground">mmol/L · 平稳</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Pill className="h-3.5 w-3.5" /> 今日用药
          </div>
          <p className="mt-1 text-xl font-bold text-primary">
            1<span className="text-sm font-medium text-muted-foreground">/3</span>
          </p>
          <p className="text-[11px] text-muted-foreground">下次 12:30</p>
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

      {/* 今日任务 */}
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">今日任务</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">打卡得积分</span>
          </div>
          <button className="flex items-center text-sm text-primary">
            全部 <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {tasks.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setOpenTask(t)}
                className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${t.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
                {t.done ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" /> {t.doneLabel}
                  </span>
                ) : (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenTask(t);
                    }}
                    className="rounded-full border border-primary/40 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10"
                  >
                    {t.actionLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

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
            <div className="flex items-center gap-2 whitespace-nowrap">
              <p className="truncate text-base font-semibold">老年综合评估自评</p>
              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
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
            { title: "认知障碍早期信号识别 BEFAST 口诀", tag: "科普", read: "3 min" },
            { title: "居家认知训练怎么做", tag: "康复", read: "6 min" },
            { title: "抗血小板药物长期服用要点", tag: "用药", read: "4 min" },
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

      {/* 任务详情 ActionSheet */}
      <PatientActionSheet
        open={!!openTask}
        onOpenChange={(v) => !v && setOpenTask(null)}
        title={openTask?.type === "med" ? "用药计划" : openTask?.type === "diet" ? "饮食打卡" : openTask?.type === "exercise" ? "运动任务" : openTask?.title ?? ""}
        description={openTask?.type === "med" ? "查看用药计划并记录服药" : openTask?.type === "diet" ? "拍照或语音打卡,AI 分析饮食结构" : openTask?.type === "exercise" ? "记录实际运动时长与强度" : undefined}
      >
        {openTask?.type === "med" && (
          <div className="space-y-3">
            <div className="rounded-xl border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm">
                <Camera className="h-4 w-4 text-primary" />
                <span className="font-medium">拍照记录本次服药</span>
              </div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => toast({ title: "已拍照", description: "药盒信息识别成功" })}>
                  <Camera className="mr-1 h-4 w-4" /> 拍药盒
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => toast({ title: "已语音记录" })}>
                  <Mic className="mr-1 h-4 w-4" /> 语音
                </Button>
              </div>
            </div>
            <p className="px-1 text-sm font-semibold">我的用药计划</p>
            {medPlan.map((m) => (
              <div key={m.name} className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{m.name}</p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{m.dose}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.times.map((t) => (
                    <span key={t} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                      <Clock className="h-3 w-3" /> {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => toast({ title: "添加用药", description: "可扫码药盒或手动录入" })}>
              <Plus className="mr-1 h-4 w-4" /> 添加用药 / 设置服药时间
            </Button>
            <Button
              className="w-full bg-gradient-primary"
              onClick={() => {
                if (openTask) markDone(openTask.id);
                toast({ title: "已记录服药", description: "+20 积分" });
                setOpenTask(null);
              }}
            >
              确认已服药并记录
            </Button>
          </div>
        )}

        {openTask?.type === "diet" && (
          <div className="space-y-3">
            <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-white p-3 ring-1 ring-cyan-100 dark:from-cyan-950/40 dark:to-transparent dark:ring-cyan-900/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">通用饮食方案 · 午餐</p>
                <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">约 560 千卡</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">推荐结构:粗细搭配主食 + 优质蛋白 + 深色蔬菜(与方案保持一致)</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">粗细搭配主食</span>
                    <span className="text-xs text-primary">75-100 克(生重)</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {["糙米饭", "杂粮饭", "全麦面"].map((i) => (
                      <span key={i} className="rounded-md bg-white px-2 py-0.5 text-[11px] ring-1 ring-border dark:bg-card">{i}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">优质蛋白</span>
                    <span className="text-xs text-primary">1 掌心份</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {["清蒸鲈鱼", "白灼虾", "香煎三文鱼", "去皮鸡胸"].map((i) => (
                      <span key={i} className="rounded-md bg-white px-2 py-0.5 text-[11px] ring-1 ring-border dark:bg-card">{i}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">深色蔬菜</span>
                    <span className="text-xs text-primary">≥ 200 克</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {["西兰花", "菠菜", "芦笋", "彩椒"].map((i) => (
                      <span key={i} className="rounded-md bg-white px-2 py-0.5 text-[11px] ring-1 ring-border dark:bg-card">{i}</span>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">提示:少盐少油,酱汁不超过 1 勺</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-primary/5 p-3">
              <p className="mb-2 text-sm font-semibold">本餐打卡</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => toast({ title: "已拍照", description: "AI 正在识别菜品……" })}>
                  <Camera className="mr-1 h-4 w-4" /> 拍照
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => toast({ title: "语音打卡中" })}>
                  <Mic className="mr-1 h-4 w-4" /> 语音
                </Button>
              </div>
              <div className="mt-3 rounded-lg border bg-card p-3 text-xs">
                <p className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" /> AI 饮食结构分析
                </p>
                <div className="space-y-1">
                  <p>· 碳水占比 <b>52%</b> · 蛋白质 <b>21%</b> · 脂肪 <b>27%</b></p>
                  <p>· 钠摄入偏高,建议下一餐减少咸菜/酱汁</p>
                  <p>· 蔬菜量达标,继续保持深色蔬菜比例</p>
                </div>
              </div>
            </div>
            <Button
              className="w-full bg-gradient-primary"
              onClick={() => {
                if (openTask) markDone(openTask.id);
                toast({ title: "本餐打卡成功", description: "+15 积分" });
                setOpenTask(null);
              }}
            >
              提交打卡
            </Button>
          </div>
        )}

        {openTask?.type === "exercise" && (
          <div className="space-y-3">
            <p className="px-1 text-sm font-semibold">今日康复训练</p>
            {exerciseSessions.map((s) => (
              <div key={s.name} className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{s.name}</p>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                    {s.intensity} · {s.duration} min
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
            <div className="rounded-xl bg-primary/5 p-3">
              <p className="mb-2 text-sm font-semibold">记录本次实际训练</p>
              <label className="text-xs text-muted-foreground">实际时长 (分钟)</label>
              <div className="mt-1 flex items-center gap-2">
                {[5, 10, 15, 20, 30].map((m) => (
                  <button
                    key={m}
                    onClick={() => setExMinutes(m)}
                    className={`flex-1 rounded-lg border py-1.5 text-sm ${exMinutes === m ? "border-primary bg-primary/10 font-medium text-primary" : ""}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <label className="mt-3 block text-xs text-muted-foreground">强度感受</label>
              <div className="mt-1 grid grid-cols-4 gap-2">
                {["轻松", "刚好", "偏累", "很累"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setExFeel(f)}
                    className={`rounded-lg border py-1.5 text-sm ${exFeel === f ? "border-primary bg-primary/10 font-medium text-primary" : ""}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <Button
              className="w-full bg-gradient-primary"
              onClick={() => {
                if (openTask) markDone(openTask.id);
                toast({ title: "训练已记录", description: `${exMinutes} 分钟 · ${exFeel} · +30 积分` });
                setOpenTask(null);
              }}
            >
              提交记录
            </Button>
          </div>
        )}

        {openTask?.type === "bp" && (
          <div className="space-y-3">
            <p className="text-sm">本次晨起测量已记录:<b className="text-emerald-600">128 / 82 mmHg</b></p>
            <Button className="w-full bg-gradient-primary" onClick={() => setOpenTask(null)}>关闭</Button>
          </div>
        )}
      </PatientActionSheet>

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
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px]">
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
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
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
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{current.desc}</p>
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
