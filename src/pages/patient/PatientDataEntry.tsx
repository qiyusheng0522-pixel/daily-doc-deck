import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Keyboard, Bluetooth, Clock, Droplet, HeartPulse, Scale, Footprints, Plus, RefreshCw, Sparkles, Wifi, CheckCircle2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

type Tab = "manual" | "device";

type Metric = { key: string; label: string; value: string; unit: string; time: string; trend: string; icon: any; color: string; bg: string; fields: { label: string; placeholder: string; suffix?: string }[]; tags?: string[] };

const metrics: Metric[] = [
  { key: "glu", label: "血糖", value: "5.6", unit: "mmol/L", time: "今 08:10 · 空腹", trend: "近 7 日平稳", icon: Droplet, color: "text-sky-600", bg: "bg-sky-100",
    fields: [{ label: "血糖值", placeholder: "5.6", suffix: "mmol/L" }], tags: ["空腹", "餐前", "餐后 2h", "睡前", "随机"] },
  { key: "bp", label: "血压", value: "128/82", unit: "mmHg", time: "昨 21:30", trend: "正常高值", icon: HeartPulse, color: "text-rose-600", bg: "bg-rose-100",
    fields: [{ label: "收缩压", placeholder: "128", suffix: "mmHg" }, { label: "舒张压", placeholder: "82", suffix: "mmHg" }, { label: "心率", placeholder: "72", suffix: "bpm" }], tags: ["晨起", "午间", "睡前", "服药后"] },
  { key: "wt", label: "体重", value: "68.2", unit: "kg", time: "今晨", trend: "近月 -0.6kg", icon: Scale, color: "text-emerald-600", bg: "bg-emerald-100",
    fields: [{ label: "体重", placeholder: "68.2", suffix: "kg" }, { label: "腰围(选填)", placeholder: "84", suffix: "cm" }] },
  { key: "step", label: "运动步数", value: "6,840", unit: "步", time: "今日累计", trend: "达标 68%", icon: Footprints, color: "text-amber-600", bg: "bg-amber-100",
    fields: [{ label: "步数", placeholder: "6840", suffix: "步" }, { label: "时长(选填)", placeholder: "45", suffix: "分钟" }] },
];

const devices = [
  { name: "鱼跃血糖仪", model: "Yuwell 580 · 血糖", status: "已连接", info: "今 08:11 · 同步 1 条", icon: Bluetooth, tone: "connected" as const },
  { name: "欧姆龙电子血压计", model: "HEM-7156 · 血压", status: "已连接", info: "昨 21:30 · 同步 1 条", icon: Bluetooth, tone: "connected" as const },
  { name: "华为体脂秤", model: "Scale 3 Pro · 体重 / 体脂", status: "同步中", info: "同步中…", icon: Wifi, tone: "syncing" as const },
  { name: "小米手环 9", model: "Mi Band 9 · 步数 / 心率 / 睡眠", status: "去连接", info: "未连接", icon: Bluetooth, tone: "unpaired" as const },
];

const PatientDataEntry = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("manual");
  const [openMetric, setOpenMetric] = useState<Metric | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeTag, setActiveTag] = useState<string>("");
  const [note, setNote] = useState("");

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-3 py-3">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">健康数据录入</h1>
        <span className="w-9" />
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-8">
        {/* Tab 切换 */}
        <div className="flex rounded-2xl bg-muted p-1">
          <button
            onClick={() => setTab("manual")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition ${
              tab === "manual" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Keyboard className="h-4 w-4" /> 手动录入
          </button>
          <button
            onClick={() => setTab("device")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition ${
              tab === "device" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Bluetooth className="h-4 w-4" /> 设备同步
          </button>
        </div>

        {/* 今日待录入卡 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-primary p-5 text-primary-foreground shadow-md">
          <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-[11px]">
            今日待录入
          </div>
          <p className="text-xl font-bold">午餐前血糖 · 晚餐后血压</p>
          <p className="mt-1.5 text-xs opacity-90">主诊医生本周关注:餐后血糖波动</p>
          <Clock className="absolute right-4 top-4 h-5 w-5 opacity-80" />
        </div>

        {tab === "manual" ? (
          <>
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-muted-foreground">常用指标</p>
              <button
                onClick={() => toast({ title: "趋势与 AI 分析", description: "示例" })}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary"
              >
                <Sparkles className="h-3.5 w-3.5" /> 趋势与 AI 分析 ›
              </button>
            </div>

            <div className="space-y-2">
              {metrics.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.key} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border/60">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${m.bg}`}>
                      <Icon className={`h-5 w-5 ${m.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm text-muted-foreground">{m.label}</p>
                        <p className="text-[11px] text-muted-foreground">{m.time}</p>
                      </div>
                      <p className="mt-0.5 text-2xl font-bold leading-tight">
                        {m.value}
                        <span className="ml-1 text-xs font-medium text-muted-foreground">{m.unit}</span>
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-emerald-600">
                        <Sparkles className="h-3 w-3" /> {m.trend}
                      </p>
                    </div>
                    <button
                      onClick={() => { setOpenMetric(m); setValues({}); setActiveTag(m.tags?.[0] ?? ""); setNote(""); }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-muted-foreground">已绑定设备</p>
              <button
                onClick={() => toast({ title: "全部同步中" })}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary"
              >
                <RefreshCw className="h-3.5 w-3.5" /> 全部同步
              </button>
            </div>

            <div className="space-y-2">
              {devices.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.name}
                    onClick={() => toast({ title: d.name, description: d.info })}
                    className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-sm ring-1 ring-border/60"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{d.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{d.model}</p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{d.info}</p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        d.tone === "connected"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                          : d.tone === "syncing"
                          ? "bg-sky-50 text-sky-600 dark:bg-sky-950/40"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/40"
                      }`}
                    >
                      {d.tone === "connected" && <CheckCircle2 className="h-3 w-3" />}
                      {d.tone === "syncing" && <RefreshCw className="h-3 w-3 animate-spin" />}
                      {d.tone === "unpaired" && <Plus className="h-3 w-3" />}
                      {d.status}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => toast({ title: "添加新设备", description: "支持鱼跃 / 欧姆龙 / 云港 / 华为 / 小米 等常见血糖仪、血压计、体脂秤" })}
              className="flex w-full items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-medium text-primary"
            >
              <Plus className="h-4 w-4" /> 添加新设备
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              支持鱼跃 / 欧姆龙 / 三诺 / 华为 / 小米 等常见血糖仪、血压计、体脂秤
            </p>
          </>
        )}
      </main>

      {/* 录入弹窗 */}
      {openMetric && (
        <div className="absolute inset-0 z-40 flex items-end bg-black/40" onClick={() => setOpenMetric(null)}>
          <div className="w-full rounded-t-3xl bg-card p-4 pb-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${openMetric.bg}`}>
                  <openMetric.icon className={`h-5 w-5 ${openMetric.color}`} />
                </div>
                <div>
                  <p className="text-base font-semibold">录入 {openMetric.label}</p>
                  <p className="text-[11px] text-muted-foreground">请填写本次实测数据</p>
                </div>
              </div>
              <button onClick={() => setOpenMetric(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {openMetric.tags && (
              <div className="mb-3">
                <p className="mb-1.5 text-xs text-muted-foreground">测量时段</p>
                <div className="flex flex-wrap gap-1.5">
                  {openMetric.tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTag(t)}
                      className={`rounded-full px-3 py-1 text-xs ${activeTag === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {openMetric.fields.map((f) => (
                <div key={f.label}>
                  <label className="mb-1 block text-xs text-muted-foreground">{f.label}</label>
                  <div className="flex items-center gap-2 rounded-xl border bg-background px-3">
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder={f.placeholder}
                      value={values[f.label] ?? ""}
                      onChange={(e) => setValues({ ...values, [f.label]: e.target.value })}
                      className="h-11 flex-1 bg-transparent text-base outline-none"
                    />
                    {f.suffix && <span className="text-xs text-muted-foreground">{f.suffix}</span>}
                  </div>
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">备注(选填)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="如:今日头晕、漏服降压药等"
                  className="w-full rounded-xl border bg-background p-2.5 text-sm outline-none"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1 rounded-lg bg-primary/5 p-2 text-[11px] text-primary">
              <Clock className="h-3 w-3" /> 记录时间 {new Date().toLocaleString("zh-CN", { hour12: false }).slice(5, 16)}
            </div>

            <Button
              className="mt-3 w-full bg-gradient-primary"
              onClick={() => {
                const filled = openMetric.fields.every((f) => (values[f.label] ?? "").trim() !== "");
                if (!filled) { toast({ title: "请填写完整", description: "所有必填项均需填写" }); return; }
                const summary = openMetric.fields.map((f) => `${values[f.label]}${f.suffix ?? ""}`).join(" / ");
                toast({ title: `${openMetric.label} 已录入`, description: `${activeTag ? activeTag + " · " : ""}${summary}` });
                setOpenMetric(null);
              }}
            >
              保存记录
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDataEntry;
