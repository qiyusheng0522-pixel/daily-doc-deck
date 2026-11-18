import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { chats, doctorPatients, doctor, planRecordsByPatient } from "@/data/doctorMock";
import { Sparkles, RefreshCw, User, ClipboardList, Mic, Send, X, ChevronLeft } from "lucide-react";
import ActionSheet from "@/components/nurse/ActionSheet";

const aiSuggestion = (name: string) =>
  `${name}，您好！从最近记录来看，晨起血压仍偏高（≥160/95），建议：\n1) 按医嘱按时服用降压药，不要漏服；\n2) 每日晨起、睡前各测一次血压并打卡；\n3) 低盐饮食（每日盐 <5g），避免腌制品；\n4) 每天30分钟中等强度有氧运动，如快走。\n如有头晕、肢体麻木等症状请立即联系我。—— ${doctor.name} 医生`;

type Msg = { id: string; from: "doctor" | "patient"; text: string; time: string };

const nowTime = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

const patientReplyFor = (text: string) => {
  const t = text.trim();
  if (/血压|药|服/.test(t)) return "好的医生，我按您说的做，今晚就开始记录血压。";
  if (/饮食|盐|吃/.test(t)) return "明白，我会注意清淡饮食，少放盐。";
  if (/运动|走/.test(t)) return "好的，我每天饭后散步 30 分钟。";
  if (/复诊|检查/.test(t)) return "收到，我下周去医院复查。";
  return "谢谢医生，我知道了。";
};

const DoctorChat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const chat = chats.find((c) => c.patientId === id);
  const patient = doctorPatients.find((p) => p.id === id);
  const [showAI, setShowAI] = useState(true);
  const [msg, setMsg] = useState("");
  const [planOpen, setPlanOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!chat || !patient) return <Navigate to="/doctor/communication" replace />;
  const records = planRecordsByPatient[patient.id] ?? [];
  const currentPlan = records.find((r) => r.status === "进行中") ?? records[records.length - 1];

  const send = (text?: string) => {
    const content = (text ?? msg).trim();
    if (!content) return;
    const doctorMsg: Msg = { id: `d-${Date.now()}`, from: "doctor", text: content, time: nowTime() };
    setMessages((m) => [...m, doctorMsg]);
    setMsg("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: `p-${Date.now()}`, from: "patient", text: patientReplyFor(content), time: nowTime() },
      ]);
    }, 900);
  };

  return (
    <div className="flex h-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-primary">
          <ChevronLeft className="h-5 w-5" /> 返回
        </button>
        <h1 className="text-base font-semibold">{chat.patientName}</h1>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <p className="text-center text-xs text-muted-foreground">{chat.createdAt}</p>
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">暂无消息，输入内容开始沟通</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "doctor" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[75%]">
              <div
                className={`whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                  m.from === "doctor"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground ring-1 ring-border/60"
                }`}
              >
                {m.text}
              </div>
              <p className={`mt-1 text-[10px] text-muted-foreground ${m.from === "doctor" ? "text-right" : ""}`}>
                {m.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      <div className="border-t bg-card">
        <div className="px-3 py-2">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI开
              </button>
              <button className="rounded-full bg-muted p-1.5 text-primary">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(`/doctor/patients/${patient.id}`)} className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-muted px-3 py-1.5 text-xs font-medium">
                <User className="h-3.5 w-3.5" /> 档案
              </button>
              <button onClick={() => setPlanOpen(true)} className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-muted px-3 py-1.5 text-xs font-medium">
                <ClipboardList className="h-3.5 w-3.5" /> 方案
              </button>
            </div>
          </div>

          {showAI && (
            <div className="mb-2 flex items-start gap-2 rounded-2xl bg-primary/5 p-3 ring-1 ring-primary/20">
              <p className="flex-1 whitespace-pre-line text-sm leading-relaxed text-foreground">
                {aiSuggestion(patient.name)}
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { send(aiSuggestion(patient.name)); setShowAI(false); }}
                  className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground"
                >
                  发送
                </button>
                <button onClick={() => setShowAI(false)} className="self-end text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2"
          >
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="输入消息…"
              className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Mic className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              type="submit"
              disabled={!msg.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <ActionSheet
        open={planOpen}
        onOpenChange={setPlanOpen}
        title="当前方案"
        description={currentPlan ? `${currentPlan.disease} · ${currentPlan.status}` : "暂无方案"}
      >
        {currentPlan ? (
          <div className="space-y-3 py-2 text-sm">
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground">科室</p>
              <p className="mt-1 font-medium">{currentPlan.department}</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground">周期</p>
              <p className="mt-1 font-medium">{currentPlan.time}</p>
            </div>
            {currentPlan.note && (
              <div className="rounded-xl bg-primary/5 p-3 ring-1 ring-primary/20">
                <p className="text-xs text-muted-foreground">备注</p>
                <p className="mt-1">{currentPlan.note}</p>
              </div>
            )}
            <button onClick={() => { setPlanOpen(false); navigate(`/doctor/patients/${patient.id}`); }}
              className="mt-2 block w-full rounded-xl bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground">

              查看完整方案记录
            </button>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">该患者暂无方案</p>
        )}
      </ActionSheet>
    </div>
  );
};

export default DoctorChat;

