import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, HeartPulse, Utensils, Activity, CheckCircle2, ChevronRight, AlertCircle, Moon, Smile, Pill, ClipboardList, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type Question = {
  id: string;
  text: string;
  options: { label: string; score: number }[];
};

type Questionnaire = {
  id: string;
  name: string;
  desc: string;
  icon: any;
  color: string;
  required: boolean;
  minutes: number;
  questions: Question[];
};

const questionnaires: Questionnaire[] = [
  {
    id: "essen",
    name: "Essen 认知风险分级",
    desc: "评估复发风险,共 5 题",
    icon: Brain,
    color: "from-sky-500 to-cyan-500",
    required: true,
    minutes: 3,
    questions: [
      { id: "q1", text: "年龄 ≥ 75 岁?", options: [{ label: "是", score: 2 }, { label: "否", score: 0 }] },
      { id: "q2", text: "有高血压病史?", options: [{ label: "有", score: 1 }, { label: "无", score: 0 }] },
      { id: "q3", text: "有认知障碍或 主观认知下降 病史?", options: [{ label: "有", score: 1 }, { label: "无", score: 0 }] },
      { id: "q4", text: "有冠心病或心梗史?", options: [{ label: "有", score: 1 }, { label: "无", score: 0 }] },
      { id: "q5", text: "当前吸烟?", options: [{ label: "是", score: 1 }, { label: "否", score: 0 }] },
    ],
  },
  {
    id: "nihss",
    name: "MMSE 认知量表",
    desc: "评估神经功能缺损",
    icon: Activity,
    color: "from-violet-500 to-fuchsia-500",
    required: true,
    minutes: 5,
    questions: [
      { id: "n1", text: "意识水平", options: [{ label: "清醒", score: 0 }, { label: "嗜睡", score: 1 }, { label: "昏睡", score: 2 }] },
      { id: "n2", text: "左侧肢体活动", options: [{ label: "正常", score: 0 }, { label: "轻度无力", score: 1 }, { label: "明显无力", score: 3 }] },
      { id: "n3", text: "言语功能", options: [{ label: "正常", score: 0 }, { label: "含糊", score: 1 }, { label: "困难", score: 2 }] },
    ],
  },
  {
    id: "mrs",
    name: "MoCA 改良 Rankin 量表",
    desc: "评估日常生活能力",
    icon: HeartPulse,
    color: "from-rose-500 to-pink-500",
    required: true,
    minutes: 2,
    questions: [
      { id: "m1", text: "日常活动能力", options: [{ label: "完全独立", score: 0 }, { label: "轻度受限", score: 1 }, { label: "需要帮助", score: 3 }] },
      { id: "m2", text: "行走能力", options: [{ label: "独立行走", score: 0 }, { label: "需搀扶", score: 2 }, { label: "无法行走", score: 4 }] },
    ],
  },
  {
    id: "diet",
    name: "饮食习惯评估",
    desc: "食盐、油脂、蔬果、奶制品",
    icon: Utensils,
    color: "from-emerald-500 to-teal-500",
    required: true,
    minutes: 3,
    questions: [
      { id: "d1", text: "每日食盐摄入", options: [{ label: "< 5g", score: 0 }, { label: "5-8g", score: 1 }, { label: "> 8g", score: 2 }] },
      { id: "d2", text: "每日蔬菜摄入", options: [{ label: "≥ 500g", score: 0 }, { label: "300-500g", score: 1 }, { label: "< 300g", score: 2 }] },
      { id: "d3", text: "每日奶制品", options: [{ label: "每日 250ml", score: 0 }, { label: "偶尔", score: 1 }, { label: "不摄入", score: 2 }] },
    ],
  },
  {
    id: "exercise",
    name: "运动习惯评估",
    desc: "运动频率与强度",
    icon: Activity,
    color: "from-amber-500 to-orange-500",
    required: false,
    minutes: 2,
    questions: [
      { id: "e1", text: "每周运动次数", options: [{ label: "≥ 5 次", score: 0 }, { label: "2-4 次", score: 1 }, { label: "< 2 次", score: 2 }] },
      { id: "e2", text: "每次运动时长", options: [{ label: "≥ 30 分钟", score: 0 }, { label: "10-30 分钟", score: 1 }, { label: "< 10 分钟", score: 2 }] },
    ],
  },
  {
    id: "sleep",
    name: "睡眠质量评估",
    desc: "睡眠时长与入睡时间",
    icon: Moon,
    color: "from-indigo-500 to-violet-500",
    required: false,
    minutes: 2,
    questions: [
      { id: "s1", text: "每日睡眠时长", options: [{ label: "7-8 小时", score: 0 }, { label: "5-7 小时", score: 1 }, { label: "< 5 小时", score: 2 }] },
      { id: "s2", text: "入睡时间", options: [{ label: "23 点前", score: 0 }, { label: "23-12 点", score: 1 }, { label: "12 点后", score: 2 }] },
    ],
  },
  {
    id: "mood",
    name: "PHQ-9 情绪自评",
    desc: "近两周情绪状态",
    icon: Smile,
    color: "from-cyan-500 to-sky-500",
    required: false,
    minutes: 4,
    questions: [
      { id: "p1", text: "对事情兴趣或愉快感减少", options: [{ label: "完全没有", score: 0 }, { label: "偶尔", score: 1 }, { label: "经常", score: 2 }] },
      { id: "p2", text: "感到情绪低落、沮丧", options: [{ label: "完全没有", score: 0 }, { label: "偶尔", score: 1 }, { label: "经常", score: 2 }] },
    ],
  },
  {
    id: "med",
    name: "服药依从性评估",
    desc: "药物使用与漏服情况",
    icon: Pill,
    color: "from-orange-500 to-rose-500",
    required: true,
    minutes: 2,
    questions: [
      { id: "md1", text: "是否按时服药", options: [{ label: "总是", score: 0 }, { label: "偶尔漏服", score: 1 }, { label: "经常漏服", score: 2 }] },
      { id: "md2", text: "是否自行调整药量", options: [{ label: "从不", score: 0 }, { label: "偶尔", score: 1 }, { label: "经常", score: 2 }] },
    ],
  },
];

const categories = [
  { key: "risk", label: "认知评估量表", desc: "复发风险 / 神经功能 / 残障", ids: ["essen", "nihss", "mrs"] },
  { key: "life", label: "生活方式评估", desc: "饮食 / 运动 / 睡眠", ids: ["diet", "exercise", "sleep"] },
  { key: "psy", label: "心理与依从性", desc: "情绪 / 用药依从", ids: ["mood", "med"] },
];

const PatientAssessment = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState<Record<string, number>>({ essen: 3, diet: 2 });

  const current = questionnaires.find((q) => q.id === active);
  const total = questionnaires.length;
  const doneCount = Object.keys(completed).length;
  const requiredList = questionnaires.filter((q) => q.required);
  const requiredDone = requiredList.filter((q) => completed[q.id] !== undefined).length;
  const allRequiredDone = requiredDone === requiredList.length;
  const progressPct = (doneCount / total) * 100;

  if (current) {
    const totalQ = current.questions.length;
    const answered = current.questions.filter((q) => answers[q.id] !== undefined).length;
    const allAnswered = answered === totalQ;

    return (
      <div className="space-y-4 px-4 pt-4 pb-6">
        <div className={`rounded-2xl bg-gradient-to-br ${current.color} p-4 text-white`}>
          <p className="text-sm opacity-90">{current.desc}</p>
          <h2 className="text-2xl font-bold">{current.name}</h2>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span>进度 {answered}/{totalQ}</span>
            <span>预计 {current.minutes} 分钟</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/30">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${(answered / totalQ) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-3">
          {current.questions.map((q, idx) => (
            <div key={q.id} className="rounded-xl border bg-card p-4">
              <p className="mb-3 text-base font-medium">
                <span className="mr-1 text-primary">Q{idx + 1}.</span>{q.text}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setAnswers({ ...answers, [q.id]: opt.score })}
                    className={`rounded-lg border py-2.5 text-base transition-colors ${
                      answers[q.id] === opt.score
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 -mx-4 space-y-2 border-t bg-card p-4">
          <Button
            size="lg"
            className="w-full bg-gradient-primary text-base"
            disabled={!allAnswered}
            onClick={() => {
              const score = current.questions.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
              setCompleted({ ...completed, [current.id]: score });
              toast({ title: "评估完成", description: `本次得分 ${score} 分` });
              setActive(null);
              setAnswers({});
            }}
          >
            {allAnswered ? "提交本份问卷" : `还差 ${totalQ - answered} 题`}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setActive(null)}>
            返回评估列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pt-4 pb-6">
      {/* 顶部进度卡 */}
      <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">评估问卷</h2>
            <p className="mt-1 text-sm opacity-90">按分类完成问卷,系统生成健康风险评估</p>
          </div>
          <ClipboardList className="h-8 w-8 opacity-80" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-xs opacity-90">全部问卷</p>
            <p className="mt-0.5 text-xl font-bold">
              {doneCount}<span className="text-sm font-medium opacity-80">/{total}</span>
            </p>
            <div className="mt-1.5 h-1.5 rounded-full bg-white/30">
              <div className="h-full rounded-full bg-white" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-xs opacity-90">必填问卷</p>
            <p className="mt-0.5 text-xl font-bold">
              {requiredDone}<span className="text-sm font-medium opacity-80">/{requiredList.length}</span>
            </p>
            <div className="mt-1.5 h-1.5 rounded-full bg-white/30">
              <div className="h-full rounded-full bg-white" style={{ width: `${(requiredDone / requiredList.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-3 px-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-rose-500" /> 必填
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> 已填写
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-orange-400" /> 未填写
        </span>
      </div>

      {/* 分类问卷 */}
      {categories.map((cat) => {
        const items = cat.ids.map((id) => questionnaires.find((q) => q.id === id)!).filter(Boolean);
        const catDone = items.filter((q) => completed[q.id] !== undefined).length;
        return (
          <section key={cat.key}>
            <div className="mb-2 flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-semibold">{cat.label}</h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{cat.desc}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {catDone}/{items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((q) => {
                const done = completed[q.id] !== undefined;
                const Icon = q.icon;
                return (
                  <button
                    key={q.id}
                    onClick={() => setActive(q.id)}
                    className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${q.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-sm font-semibold">{q.name}</p>
                        {q.required && (
                          <span className="shrink-0 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:bg-rose-950/40">
                            必填
                          </span>
                        )}
                        {done ? (
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40">
                            <CheckCircle2 className="h-2.5 w-2.5" /> 已填写
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-600 dark:bg-orange-950/40">
                            <AlertCircle className="h-2.5 w-2.5" /> 未填写
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {q.desc} · 约 {q.minutes} 分钟
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* 风险评估结果入口 */}
      <button
        onClick={() => navigate("/patient/risk")}
        className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 p-4 text-left text-white shadow-md active:scale-[0.99]"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold">点击查看我的健康风险评估</p>
          <p className="mt-0.5 text-xs opacity-90">
            {allRequiredDone
              ? "必填已完成,查看风险内容 / 健康目录 / 健康建议"
              : `必填还差 ${requiredList.length - requiredDone} 份,可先查看当前评估`}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0" />
      </button>

      {allRequiredDone && (
        <Button
          size="lg"
          variant="outline"
          className="w-full text-base"
          onClick={() => navigate("/patient/plan")}
        >
          查看健康方案 <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default PatientAssessment;
