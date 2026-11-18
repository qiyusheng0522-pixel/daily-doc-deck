import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Pill, Utensils, Dumbbell, HeartPulse, CheckCircle2, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Task = {
  id: string;
  title: string;
  sub: string;
  time: string;
  done?: boolean;
};

type Group = {
  key: string;
  label: string;
  icon: typeof Pill;
  color: string;
  bg: string;
  tasks: Task[];
};

const initialGroups: Group[] = [
  {
    key: "med",
    label: "用药打卡",
    icon: Pill,
    color: "text-sky-600",
    bg: "bg-sky-100",
    tasks: [
      { id: "m1", title: "三甲双胍缓释片", sub: "0.5g · 随餐服用", time: "08:00", done: true },
      { id: "m2", title: "二甲双胍缓释片", sub: "0.5g · 随餐服用", time: "12:30" },
      { id: "m3", title: "阿托伐他汀钙", sub: "20mg · 睡前", time: "22:00" },
    ],
  },
  {
    key: "diet",
    label: "饮食打卡",
    icon: Utensils,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    tasks: [
      { id: "d1", title: "早餐打卡", sub: "语音描述 / 拍照识别菜品", time: "已完成", done: true },
      { id: "d2", title: "午餐打卡", sub: "推荐:糙米饭 + 清蒸鲈鱼", time: "12:00" },
      { id: "d3", title: "晚餐打卡", sub: "推荐:杂粮饭 + 蔬菜汤", time: "18:30" },
    ],
  },
  {
    key: "ex",
    label: "运动打卡",
    icon: Dumbbell,
    color: "text-violet-600",
    bg: "bg-violet-100",
    tasks: [{ id: "e1", title: "康复训练 · 15 分钟", sub: "手部精细动作", time: "18:00" }],
  },
  {
    key: "bp",
    label: "监测打卡",
    icon: HeartPulse,
    color: "text-rose-600",
    bg: "bg-rose-100",
    tasks: [{ id: "b1", title: "晚餐后血压", sub: "主诊医生本周关注", time: "20:00" }],
  },
];

const PatientTasks = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(initialGroups);

  const total = groups.reduce((n, g) => n + g.tasks.length, 0);
  const doneCount = groups.reduce((n, g) => n + g.tasks.filter((t) => t.done).length, 0);
  const percent = Math.round((doneCount / total) * 100);

  const check = (gKey: string, tId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.key === gKey ? { ...g, tasks: g.tasks.map((t) => (t.id === tId ? { ...t, done: true } : t)) } : g,
      ),
    );
    toast({ title: "打卡成功", description: "+10 积分" });
  };

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-3 py-3">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">今日任务</h1>
        <span className="w-9" />
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-8">
        {/* 进度卡 */}
        <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-primary p-5 text-primary-foreground shadow-md">
          <p className="text-xs opacity-90">今日进度</p>
          <p className="mt-1 text-3xl font-bold">
            {doneCount}/{total}
            <span className="ml-2 text-sm font-medium opacity-90">完成 {percent}%</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>

        {groups.map((g) => {
          const Icon = g.icon;
          const gDone = g.tasks.filter((t) => t.done).length;
          return (
            <section key={g.key}>
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${g.bg}`}>
                    <Icon className={`h-4 w-4 ${g.color}`} />
                  </span>
                  <p className="text-sm font-semibold">{g.label}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {gDone}/{g.tasks.length}
                </p>
              </div>
              <div className="space-y-2">
                {g.tasks.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border/60 ${
                      t.done ? "opacity-70" : ""
                    }`}
                  >
                    {t.done ? (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${g.bg}`}>
                        <Icon className={`h-5 w-5 ${g.color}`} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${t.done ? "text-muted-foreground line-through" : ""}`}>
                        {t.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t.sub}</p>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {t.time}
                      </p>
                    </div>
                    {t.done ? (
                      <span className="whitespace-nowrap rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                        已打卡
                      </span>
                    ) : (
                      <button
                        onClick={() => check(g.key, t.id)}
                        className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {g.key === "med" ? "确认服药" : "打卡"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default PatientTasks;
