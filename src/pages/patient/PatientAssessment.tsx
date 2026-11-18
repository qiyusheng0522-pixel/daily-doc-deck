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

const O = (labels: string[]) => labels.map((label, score) => ({ label, score }));
const questionnaires: Questionnaire[] = [
  {
    id: "sleep", name: "睡眠评估", desc: "近一个月睡眠质量（参照 PSQI 简版）", icon: Moon,
    color: "from-indigo-500 to-violet-500", required: true, minutes: 3,
    questions: [
      { id: "s1", text: "上床后多久能入睡？", options: O(["15 分钟内", "16-30 分钟", "31-60 分钟", "超过 1 小时"]) },
      { id: "s2", text: "每晚实际睡眠时长", options: O(["7 小时以上", "6-7 小时", "5-6 小时", "不足 5 小时"]) },
      { id: "s3", text: "夜间醒来或早醒的情况", options: O(["没有", "每周少于 1 次", "每周 1-2 次", "每周 3 次以上"]) },
      { id: "s4", text: "白天犯困、精力不足", options: O(["没有", "偶尔", "经常", "几乎每天"]) },
      { id: "s5", text: "是否需要服用助眠药物", options: O(["从不", "每周少于 1 次", "每周 1-2 次", "每周 3 次以上"]) },
    ],
  },
  {
    id: "nutrition", name: "营养评估", desc: "微型营养评估简表（MNA-SF）", icon: Utensils,
    color: "from-emerald-500 to-teal-500", required: true, minutes: 3,
    questions: [
      { id: "n1", text: "近 3 个月食量是否减少？", options: [{ label: "明显减少", score: 0 }, { label: "轻度减少", score: 1 }, { label: "没有减少", score: 2 }] },
      { id: "n2", text: "近 3 个月体重是否下降？", options: [{ label: "下降超过 3kg", score: 0 }, { label: "不清楚", score: 1 }, { label: "下降 1-3kg", score: 2 }, { label: "没有下降", score: 3 }] },
      { id: "n3", text: "活动能力", options: [{ label: "卧床或坐轮椅", score: 0 }, { label: "能下床但不外出", score: 1 }, { label: "可以外出", score: 2 }] },
      { id: "n4", text: "近 3 个月有无心理创伤或急性疾病？", options: [{ label: "有", score: 0 }, { label: "没有", score: 2 }] },
      { id: "n5", text: "精神心理状况", options: [{ label: "严重痴呆或抑郁", score: 0 }, { label: "轻度痴呆", score: 1 }, { label: "没有问题", score: 2 }] },
    ],
  },
  {
    id: "fall", name: "跌倒风险评估", desc: "居家跌倒风险自评", icon: AlertCircle,
    color: "from-amber-500 to-orange-500", required: true, minutes: 2,
    questions: [
      { id: "f1", text: "过去一年是否跌倒过？", options: [{ label: "没有", score: 0 }, { label: "1 次", score: 1 }, { label: "2 次及以上", score: 2 }] },
      { id: "f2", text: "走路时是否感到不稳、需要扶东西？", options: [{ label: "不需要", score: 0 }, { label: "有时", score: 1 }, { label: "经常", score: 2 }] },
      { id: "f3", text: "从椅子上站起是否需要用手撑？", options: [{ label: "不需要", score: 0 }, { label: "需要", score: 1 }] },
      { id: "f4", text: "是否担心自己会跌倒？", options: [{ label: "不担心", score: 0 }, { label: "有点担心", score: 1 }, { label: "非常担心", score: 2 }] },
      { id: "f5", text: "同时服用 4 种以上药物（含安眠/降压药）？", options: [{ label: "否", score: 0 }, { label: "是", score: 1 }] },
    ],
  },
  {
    id: "mental", name: "精神心理评估", desc: "老年抑郁 / 焦虑简评（GDS / GAD 简版）", icon: Smile,
    color: "from-cyan-500 to-sky-500", required: true, minutes: 3,
    questions: [
      { id: "m1", text: "最近两周，常感到情绪低落、高兴不起来", options: O(["完全没有", "有几天", "一半以上时间", "几乎每天"]) },
      { id: "m2", text: "对以前喜欢的事情失去兴趣", options: O(["完全没有", "有几天", "一半以上时间", "几乎每天"]) },
      { id: "m3", text: "感到紧张、焦虑或坐立不安", options: O(["完全没有", "有几天", "一半以上时间", "几乎每天"]) },
      { id: "m4", text: "不愿出门、减少和亲友来往", options: O(["完全没有", "有几天", "一半以上时间", "几乎每天"]) },
      { id: "m5", text: "觉得自己没用、是家人的负担", options: O(["完全没有", "有几天", "一半以上时间", "几乎每天"]) },
    ],
  },
];

const categories = [
  { key: "cga", label: "老年综合评估", desc: "睡眠 / 营养 / 跌倒风险 / 精神心理（老人或家属填写）", ids: ["sleep", "nutrition", "fall", "mental"] },
];

const PatientAssessment = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [filler, setFiller] = useState<"本人" | "家属协助">("本人");
  const [completed, setCompleted] = useState<Record<string, number>>({ sleep: 4 });

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

        <div className="flex items-center gap-2 rounded-xl border bg-card p-3 text-sm">
          <span className="text-muted-foreground">填写人</span>
          {(["本人", "家属协助"] as const).map((f) => (
            <button key={f} onClick={() => setFiller(f)}
              className={`rounded-full border px-3 py-1 ${filler === f ? "border-primary bg-primary/10 font-medium text-primary" : ""}`}>{f}</button>
          ))}
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
              toast({ title: "评估完成", description: `本次得分 ${score} 分 · 填写人：${filler}（已记录）` });
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
            <h2 className="text-2xl font-bold">老年综合评估</h2>
            <p className="mt-1 text-sm opacity-90">MMSE / MoCA 等认知量表由训练站评估师现场完成；以下由您或家属自评</p>
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
          <p className="text-base font-semibold">查看我的评估结果与风险等级</p>
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
