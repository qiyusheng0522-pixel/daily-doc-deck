import { useNavigate } from "react-router-dom";
import { ChevronLeft, Camera, FileText, Pill, HeartPulse, IdCard, Sparkles, CheckCircle2, Image as ImageIcon, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const cats = [
  { key: "lab", label: "化验单", status: "已识别 3", icon: FileText, done: true, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "med", label: "用药", status: "已识别 2", icon: Pill, done: true, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "hist", label: "既往病史", status: "待上传", icon: HeartPulse, done: false, color: "text-muted-foreground", bg: "bg-muted" },
  { key: "id", label: "身份证", status: "待上传", icon: IdCard, done: false, color: "text-muted-foreground", bg: "bg-muted" },
];

const history = [
  { type: "化验单", title: "生化全套 · 2026-07-10", detail: "空腹血糖 6.8 · HbA1c 7.2%", ago: "3 天前" },
  { type: "化验单", title: "尿常规 · 2026-06-28", detail: "尿微量白蛋白 12.3 mg/L", ago: "2 周前" },
  { type: "用药", title: "阿托伐他汀钙 · 药盒", detail: "20mg · 每日一次", ago: "3 周前" },
  { type: "化验单", title: "血脂四项 · 2026-06-10", detail: "LDL 3.4 mmol/L", ago: "1 个月前" },
];

const PatientArchive = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-3 py-3">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">AI 建档</h1>
        <span className="w-9" />
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-8">
        {/* 顶部卡 */}
        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 p-4 ring-1 ring-border/60 dark:from-sky-950/40 dark:to-cyan-950/40">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-primary">AI 建档 · 拍一拍</p>
              <p className="mt-1 text-lg font-bold leading-snug">拍照上传化验单 / 用药盒 / 既往病历</p>
              <p className="mt-1 text-xs text-muted-foreground">AI 自动识别并归档,主诊医生随访前即可查看</p>
            </div>
            <button
              onClick={() => toast({ title: "调用摄像头", description: "示例" })}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg"
            >
              <Camera className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">健康档案完成度</span>
              <span className="font-semibold text-primary">62%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/70 dark:bg-slate-800">
              <div className="h-full rounded-full bg-primary" style={{ width: "62%" }} />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {cats.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.key}
                  className={`rounded-xl p-2 text-center ring-1 ${
                    c.done ? "bg-emerald-50 ring-emerald-200 dark:bg-emerald-950/40 dark:ring-emerald-800" : "bg-white ring-border dark:bg-slate-800"
                  }`}
                >
                  <Icon className={`mx-auto h-5 w-5 ${c.color}`} />
                  <p className="mt-1 text-xs font-medium">{c.label}</p>
                  <p className={`mt-0.5 text-[14px] ${c.done ? "text-emerald-600" : "text-muted-foreground"}`}>{c.status}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI 摘要 */}
        <div className="flex items-start gap-2 rounded-2xl bg-primary/5 p-3 ring-1 ring-primary/20">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed">
            <span className="font-semibold text-primary">AI 归档摘要 · </span>
            共 5 份材料已识别,建议补充 <span className="font-semibold">既往病史</span> 与 <span className="font-semibold">身份证</span>,以便医生完成初诊建档。
          </p>
        </div>


        {/* 历史上传 */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-lg font-bold">历史上传</h2>
            <span className="text-xs text-muted-foreground">共 {history.length} 项</span>
          </div>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.title} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border/60">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[14px] text-muted-foreground">{h.type}</span>
                    <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[14px] text-emerald-600 dark:bg-emerald-950/40">
                      <CheckCircle2 className="h-2.5 w-2.5" /> 已识别
                    </span>
                  </div>
                  <p className="truncate text-sm font-semibold">{h.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{h.detail}</p>
                  <p className="mt-1 flex items-center gap-1 text-[14px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" /> {h.ago}
                  </p>
                </div>
                <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PatientArchive;
