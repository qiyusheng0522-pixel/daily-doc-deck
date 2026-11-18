import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mic, Plus, Camera, Sparkles, ArrowLeft, MoreHorizontal, Shield,
  Volume2, Hash, ChevronRight, Menu,
  Stethoscope, Pill, FileText, HeartPulse, X, AlertCircle, CheckCircle2,
  QrCode, Upload, ScanLine, PackageOpen, Clock, ChevronDown, BadgeCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ONBOARD_KEY = "patient_ai_onboard_done";

const ASSISTANT_NAME = "AI助手";
const ASSISTANT_TAG = "卒中健康守护助手";

const suggestions = [
  { icon: Volume2, text: `${ASSISTANT_NAME}能为我做什么?` },
  { icon: Hash, text: "缺血性卒中后如何科学康复训练?" },
  { icon: Hash, text: "阿司匹林饭前吃还是饭后吃?会伤胃吗?" },
];

type ActionKey = "doctor" | "med" | "report" | "manage";

const quickActions: { key: ActionKey; icon: any; label: string; color: string }[] = [
  { key: "doctor", icon: Stethoscope, label: "寻医", color: "text-sky-600 bg-sky-100 dark:bg-sky-900/40" },
  { key: "med", icon: Pill, label: "问药", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40" },
  { key: "report", icon: FileText, label: "报告解读", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/40" },
  { key: "manage", icon: HeartPulse, label: "健康管理", color: "text-rose-600 bg-rose-100 dark:bg-rose-900/40" },
];

const recDoctors = [
  { name: "王建国", title: "主任医师 · 教授", dept: "神经内科 · 南京市鼓楼医院", online: true, assistant: "张医生 · 助理组企微" },
  { name: "李慧敏", title: "副主任医师", dept: "神经内科 · 南京市鼓楼医院", online: false, assistant: "李医生助理 · 企微" },
  { name: "陈明", title: "主治医师", dept: "康复医学科 · 南京市鼓楼医院", online: true, assistant: "陈医生助理 · 企微" },
];

const servicePacks = [
  { name: "卒中二级预防 · 基础包", price: "¥ 0 / 30 天", items: ["每周 1 次 AI 随访", "月度用药提醒", "科普推送"], badge: "免费" },
  { name: "主诊医生 1v1 · 进阶包", price: "¥ 199 / 月", items: ["主诊医生 1v1 咨询 (5 次)", "健康管理师电话随访", "季度风险评估报告"], badge: "热门" },
  { name: "居家康复 · 尊享包", price: "¥ 599 / 月", items: ["康复治疗师上门 4 次", "24h 应急咨询", "家属陪同教育"], badge: "尊享" },
];

const PatientAI = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [action, setAction] = useState<ActionKey | null>(null);
  const [qrDoctor, setQrDoctor] = useState<typeof recDoctors[number] | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [onboard, setOnboard] = useState<{ archive: boolean; survey: boolean; plan: boolean }>(() => {
    try {
      const raw = localStorage.getItem(ONBOARD_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { archive: false, survey: false, plan: false };
  });
  const onboardDone = onboard.archive && onboard.survey && onboard.plan;


  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "ai", text: `已收到。作为您的${ASSISTANT_TAG},建议结合近期血压监测数据,坚持规律服用抗血小板药物,并保持低盐低脂饮食。如需详细方案请到「健康方案」查看。` },
    ]);
    setInput("");
  };


  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-violet-100 via-indigo-50 to-white dark:from-violet-950/40 dark:via-indigo-950/20 dark:to-background">
      {/* 顶部装饰大字水印 */}
      <div className="pointer-events-none absolute inset-x-0 top-24 select-none text-center text-[80px] font-black uppercase tracking-widest text-violet-300/30 dark:text-violet-800/20">
        HEALTH
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/40">
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <p className="text-lg font-bold leading-none">{ASSISTANT_NAME}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{ASSISTANT_TAG}</p>
          </div>
        </div>
        <div className="relative flex items-center gap-1.5">
          <button
            onClick={() => { setMessages([]); setInput(""); toast({ title: "已开启新会话" }); }}
            className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium shadow-sm ring-1 ring-violet-100 dark:bg-card dark:ring-violet-900/40"
          >
            <Plus className="h-3.5 w-3.5 text-violet-500" /> 新会话
          </button>
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-violet-100 dark:bg-card dark:ring-violet-900/40"
          >
            <MoreHorizontal className="h-3.5 w-3.5 text-violet-500" />
          </button>
          {moreOpen && (
            <div className="absolute right-10 top-10 z-30 w-32 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-violet-100 dark:bg-card dark:ring-violet-900/40">
              <button
                onClick={() => { setMoreOpen(false); toast({ title: "历史会话", description: "暂无更多历史记录" }); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-violet-50 dark:hover:bg-violet-900/20"
              >
                <Clock className="h-3.5 w-3.5 text-violet-500" /> 历史
              </button>
            </div>
          )}
          <Link to="/patient" className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-white/40">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-3">
        {messages.length === 0 ? (
          <>
            {/* Greeting + mascot */}
            <div className="relative flex items-start justify-between pt-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-2xl font-bold">你好呀</h2>
                  <Sparkles className="h-5 w-5 fill-violet-500 text-violet-500" />
                </div>
                <p className="mt-1 text-xl font-bold leading-tight text-foreground/90">
                  愿您血压平稳<br />卒中无忧
                </p>
              </div>
              {/* SVG 医生 mascot */}
              <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0 drop-shadow-md">
                <defs>
                  <radialGradient id="mascotHalo" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="70" cy="70" r="65" fill="url(#mascotHalo)" />
                {/* body / white coat */}
                <path d="M35 130 Q35 90 70 88 Q105 90 105 130 Z" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5" />
                <path d="M62 92 L70 108 L78 92 L74 130 L66 130 Z" fill="#a78bfa" />
                {/* face */}
                <circle cx="70" cy="60" r="26" fill="#fde7d3" />
                {/* hair */}
                <path d="M46 52 Q55 30 70 30 Q88 30 94 52 Q90 46 82 46 Q76 40 68 44 Q56 46 46 52 Z" fill="#3f2a1a" />
                {/* glasses */}
                <circle cx="60" cy="62" r="6" fill="none" stroke="#3f2a1a" strokeWidth="1.5" />
                <circle cx="80" cy="62" r="6" fill="none" stroke="#3f2a1a" strokeWidth="1.5" />
                <line x1="66" y1="62" x2="74" y2="62" stroke="#3f2a1a" strokeWidth="1.5" />
                {/* smile */}
                <path d="M64 72 Q70 76 76 72" fill="none" stroke="#3f2a1a" strokeWidth="1.5" strokeLinecap="round" />
                {/* waving hand */}
                <circle cx="108" cy="52" r="8" fill="#fde7d3" />
                <rect x="102" y="52" width="12" height="18" rx="6" fill="#fff" stroke="#e5e7eb" strokeWidth="1" />
              </svg>
            </div>

            {/* 我的健康 · 首次引导卡 (完成全部后不再展示) */}
            {!onboardDone && (
              <div className="mt-2 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-violet-100 backdrop-blur dark:bg-card dark:ring-violet-900/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full bg-violet-500" />
                    <p className="text-sm font-bold">我的健康 · 首次引导</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {[onboard.archive, onboard.survey, onboard.plan].filter(Boolean).length}/3
                  </span>
                </div>

                <ul className="mt-3 space-y-2 text-sm">
                  {[
                    { key: "archive" as const, done: onboard.archive, label: "健康档案", desc: "拍照上传化验单 / 用药 / 病历", to: "/patient/archive", cta: "去建档" },
                    { key: "survey" as const, done: onboard.survey, label: "健康问卷", desc: "完成卒中风险评估问卷", to: "/patient/assessment", cta: "去评估" },
                    { key: "plan" as const, done: onboard.plan, label: "解锁健康方案", desc: "查看专属二级预防方案模板", to: "/patient/plan", cta: "去查看" },
                  ].map((it) => (
                    <li key={it.key} className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        {it.done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 shrink-0 text-violet-500" />
                        )}
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold ${it.done ? "text-muted-foreground line-through" : "text-violet-700 dark:text-violet-300"}`}>
                            {it.label}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">{it.desc}</p>
                        </div>
                      </div>
                      {!it.done && (
                        <button
                          onClick={() => {
                            const next = { ...onboard, [it.key]: true };
                            setOnboard(next);
                            try { localStorage.setItem(ONBOARD_KEY, JSON.stringify(next)); } catch {}
                            navigate(it.to);
                          }}
                          className="shrink-0 rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white shadow-sm"
                        >
                          {it.cta}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 建议问题 */}
            <div className="mt-3 space-y-2">
              {suggestions.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.text}
                    onClick={() => send(s.text)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white/90 p-3 text-left text-sm shadow-sm ring-1 ring-violet-50 hover:bg-white dark:bg-card dark:ring-violet-900/30"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="min-w-0 flex-1 truncate">{s.text}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
              <Shield className="h-3 w-3 text-emerald-500" /> AI 建议仅供参考,不能替代医生诊断
            </div>
          </>
        ) : (
          <div className="space-y-3 pt-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-violet-600 text-white"
                      : "bg-white shadow-sm ring-1 ring-violet-100 dark:bg-card dark:ring-violet-900/30"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>




      {/* Quick action pills · 寻医 / 问药 / 报告解读 / 健康管理 */}
      <div className="relative z-10 flex gap-2 overflow-x-auto px-4 py-2">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.key}
              onClick={() => setAction(a.key)}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium shadow-sm ring-1 ring-violet-100 active:scale-95 dark:bg-card dark:ring-violet-900/30"
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full ${a.color}`}>
                <Icon className="h-3 w-3" />
              </span>
              <span>{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input bar */}
      <div className="relative z-10 flex items-center gap-2 px-3 py-2">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-violet-100 dark:bg-card dark:ring-violet-900/30">
          <Mic className="h-4 w-4 text-violet-500" />
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-violet-100 dark:bg-card dark:ring-violet-900/30">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="对话内容已开启隐私保护"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
          <button className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/40">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-md">
          <Camera className="h-4 w-4" />
        </button>
      </div>

      {/* 分类面板 */}
      {action && (
        <div className="absolute inset-0 z-40 flex items-end bg-black/40" onClick={() => setAction(null)}>
          <div className="max-h-[85%] w-full overflow-y-auto rounded-t-3xl bg-card p-4 pb-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-base font-bold">
                {action === "doctor" && "寻医 · 为您推荐"}
                {action === "med" && "问药 · 拍药盒识别"}
                {action === "report" && "报告解读 · 上传报告"}
                {action === "manage" && "健康管理 · 服务包"}
              </p>
              <button onClick={() => setAction(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {action === "doctor" && (
              <div className="space-y-2">
                <p className="mb-1 text-xs text-muted-foreground">基于您的档案(缺血性脑卒中 · 二级预防),{ASSISTANT_NAME} 推荐:</p>
                {recDoctors.map((d) => (
                  <div key={d.name} className="rounded-2xl bg-muted/40 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold">{d.name}</p>
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${d.online ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                            {d.online ? "在线" : "离线"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{d.title}</p>
                        <p className="text-[11px] text-muted-foreground">{d.dept}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => { setAction(null); toast({ title: `已发起与 ${d.name} 的咨询` }); }}
                        className="flex-1 rounded-full bg-violet-600 py-1.5 text-xs font-medium text-white"
                      >
                        立即咨询
                      </button>
                      <button
                        onClick={() => setQrDoctor(d)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-full border border-violet-200 py-1.5 text-xs font-medium text-violet-700 dark:border-violet-800 dark:text-violet-300"
                      >
                        <QrCode className="h-3.5 w-3.5" /> 助理企微
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {action === "report" && (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/60 p-6 text-center dark:bg-violet-950/30">
                  <Upload className="mx-auto h-10 w-10 text-violet-500" />
                  <p className="mt-2 text-sm font-semibold">上传您的检查报告</p>
                  <p className="mt-1 text-xs text-muted-foreground">支持化验单 / CT / MR / 出院小结 · JPG / PDF</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => toast({ title: "已拍照", description: "AI 识别中……" })} className="flex-1 rounded-full bg-violet-600 py-2 text-xs font-medium text-white">
                      <Camera className="mr-1 inline h-3.5 w-3.5" /> 拍照上传
                    </button>
                    <button onClick={() => toast({ title: "已选择文件" })} className="flex-1 rounded-full border border-violet-200 py-2 text-xs font-medium text-violet-700 dark:border-violet-800 dark:text-violet-300">
                      <Upload className="mr-1 inline h-3.5 w-3.5" /> 从相册选择
                    </button>
                  </div>
                </div>
                <div className="rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground">
                  <p className="mb-1 font-semibold text-foreground">{ASSISTANT_NAME} 可解读:</p>
                  · 卒中相关化验(同型半胱氨酸 / 血脂 / 血糖 / 凝血)<br />
                  · 头颅 CT / MR / 颈动脉超声报告<br />
                  · 出院小结与二级预防用药建议
                </div>
              </div>
            )}

            {action === "med" && (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 p-6 text-center dark:bg-emerald-950/30">
                  <ScanLine className="mx-auto h-10 w-10 text-emerald-500" />
                  <p className="mt-2 text-sm font-semibold">拍一拍您的药盒</p>
                  <p className="mt-1 text-xs text-muted-foreground">AI 自动识别药名、剂量,并给出服用建议</p>
                  <button onClick={() => toast({ title: "已拍照", description: "药盒识别中……" })} className="mt-3 w-full rounded-full bg-emerald-500 py-2 text-xs font-medium text-white">
                    <Camera className="mr-1 inline h-3.5 w-3.5" /> 拍药盒
                  </button>
                </div>
                <div className="rounded-xl bg-muted/40 p-3 text-xs">
                  <p className="mb-1.5 font-semibold">卒中常见用药 · 快速咨询</p>
                  {[
                    "阿司匹林肠溶片 100mg · 抗血小板",
                    "阿托伐他汀钙 20mg · 调脂稳斑",
                    "苯磺酸氨氯地平 5mg · 降压",
                  ].map((m) => (
                    <button key={m} onClick={() => { setAction(null); send(`我在服用${m},有什么注意事项?`); }} className="flex w-full items-center justify-between border-t py-1.5 text-left first:border-t-0">
                      <span>{m}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {action === "manage" && (
              <div className="space-y-2">
                <p className="mb-1 text-xs text-muted-foreground">按您的卒中风险等级(中高危)推荐:</p>
                {servicePacks.map((p) => (
                  <div key={p.name} className="rounded-2xl bg-gradient-to-br from-rose-50 to-white p-3 ring-1 ring-rose-100 dark:from-rose-950/30 dark:to-transparent dark:ring-rose-900/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PackageOpen className="h-5 w-5 text-rose-500" />
                        <p className="text-sm font-bold">{p.name}</p>
                      </div>
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-medium text-white">{p.badge}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-rose-600">{p.price}</p>
                    <ul className="mt-1.5 space-y-0.5 text-[11px] text-muted-foreground">
                      {p.items.map((it) => (
                        <li key={it} className="flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3 text-emerald-500" /> {it}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => { setAction(null); toast({ title: `已开通 ${p.name}` }); }} className="mt-2 w-full rounded-full bg-rose-500 py-1.5 text-xs font-medium text-white">
                      查看详情 / 开通
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 助理企微二维码 */}
      {qrDoctor && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={() => setQrDoctor(null)}>
          <div className="w-full max-w-[280px] rounded-2xl bg-card p-4 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{qrDoctor.assistant}</p>
              <button onClick={() => setQrDoctor(null)} className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mx-auto mt-3 grid h-48 w-48 grid-cols-16 gap-px overflow-hidden rounded-lg bg-white p-2 ring-1 ring-border">
              {Array.from({ length: 256 }).map((_, i) => (
                <span key={i} className={`block ${((i * 7 + (i % 5) * 3) % 3 === 0) ? "bg-foreground" : "bg-transparent"}`} />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              使用 <b className="text-foreground">企业微信</b> 扫一扫,添加 {qrDoctor.name} 的助理进行 1v1 咨询
            </p>
            <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-primary">
              <Clock className="h-3 w-3" /> 工作时间 08:00 - 20:00
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAI;
