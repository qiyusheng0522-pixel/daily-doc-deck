import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, AlertTriangle, ListChecks, Lightbulb, Activity, Heart, Utensils,
  Dumbbell, Moon, Droplets, HeartPulse, ClipboardList, FileText, ArrowRight,
} from "lucide-react";
import {
  isProfileComplete,
  subscribeProfile,
  setProfileComplete,
  riskCatalog,
  riskAdvices,
  riskSummaryText,
  riskOverview,
} from "@/data/patientProfile";

const iconMap = { Heart, Activity, Droplets, Utensils, Dumbbell, Moon, HeartPulse } as const;

const PatientRisk = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(isProfileComplete());

  useEffect(() => subscribeProfile(() => setReady(isProfileComplete())), []);

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-primary">
          <ChevronLeft className="h-5 w-5" /> 返回
        </button>
        <h1 className="text-base font-semibold">我的健康风险评估</h1>
        <span className="w-12" />
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto px-4 py-3 pb-8">
        {!ready ? (
          <UnfilledGuide onMock={() => setProfileComplete(true)} onGoAssessment={() => navigate("/patient/assessment")} onGoArchive={() => navigate("/patient/archive")} />
        ) : (
          <>
            {/* 风险内容 */}
            <section className="rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 p-4 text-white shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-base font-semibold">风险内容 · {riskOverview.level}</h2>
              </div>
              <p className="text-sm leading-relaxed opacity-95">{riskSummaryText}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-[12px] opacity-95">
                <span>Essen 评分 <b>{riskOverview.essenScore} 分</b></span>
                <span>1 年内复发风险 <b>{riskOverview.recurrenceRisk}</b></span>
                <span>优先干预：<b>{riskOverview.priority.join(" / ")}</b></span>
              </div>
            </section>

            {/* 健康风险 —— 与方案页 hero 标签一致 */}
            <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
              <div className="mb-3 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold">健康风险</h2>
              </div>
              <ul className="grid grid-cols-2 gap-2">
                {riskCatalog.map((c) => {
                  const Icon = iconMap[c.icon as keyof typeof iconMap] ?? Activity;
                  return (
                    <li key={c.label} className="flex items-center gap-2 rounded-xl bg-muted/50 p-2.5">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.tone}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs text-muted-foreground">{c.label}</p>
                        <p className="truncate text-sm font-semibold">{c.value}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* 健康建议 */}
            <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-semibold">健康建议</h2>
              </div>
              <ol className="space-y-3">
                {riskAdvices.map((a) => (
                  <li key={a.idx} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {a.idx}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{a.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

function UnfilledGuide({
  onMock,
  onGoAssessment,
  onGoArchive,
}: {
  onMock: () => void;
  onGoAssessment: () => void;
  onGoArchive: () => void;
}) {
  return (
    <>
      <section className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-4 text-white shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-base font-semibold">暂无个性化风险评估</h2>
        </div>
        <p className="text-sm leading-relaxed opacity-95">
          还没有为您生成风险评估。请先完成 <b>个人档案</b> 与 <b>必填评估问卷</b>，
          我们将根据您的病史、体检、生活习惯生成专属的风险内容、健康风险和干预建议。
        </p>
      </section>

      <button
        onClick={onGoArchive}
        className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-border/60 active:scale-[0.99]"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">补充个人档案</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">病史、用药、体检报告、家族史等</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </button>

      <button
        onClick={onGoAssessment}
        className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-border/60 active:scale-[0.99]"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">填写评估问卷</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Essen / NIHSS / mRS / 饮食 / 用药依从</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </button>

      <button
        onClick={onMock}
        className="w-full rounded-xl border border-dashed border-primary/40 py-2 text-[11px] text-primary"
      >
        （演示）标记为已补充资料，查看示例风险评估
      </button>
    </>
  );
}

export default PatientRisk;
