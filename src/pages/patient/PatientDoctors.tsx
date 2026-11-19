import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Stethoscope, Circle, QrCode, X, HeartPulse, GraduationCap, Award, MessageCircle, Search } from "lucide-react";

type Role = "doctor" | "manager";

type Person = {
  id: string;
  name: string;
  role: Role;
  title?: string;        // 职级
  dept?: string;         // 科室
  hospital?: string;
  specialty?: string;    // 擅长
  years?: number;        // 从业年限
  online: boolean;
  isAssistant?: boolean; // 助理医生
  avatarBg: string;
  qr: string;            // 二维码提示文案
};

const people: Person[] = [
  { id: "d1", name: "王建国", role: "doctor", title: "主任医师 · 教授", dept: "记忆门诊", hospital: "南京市鼓楼医院", specialty: "轻度认知障碍 / 二级预防", years: 28, online: true, avatarBg: "bg-sky-100 text-sky-700", qr: "王主任 · 企业微信" },
  { id: "d2", name: "李慧敏", role: "doctor", title: "副主任医师", dept: "记忆门诊", hospital: "南京市鼓楼医院", specialty: "主观认知下降 / 脑动脉硬化", years: 18, online: false, avatarBg: "bg-violet-100 text-violet-700", qr: "李医生 · 企业微信" },
  { id: "d3", name: "张俊(助理)", role: "doctor", title: "主治医师", dept: "记忆门诊", hospital: "南京市鼓楼医院", specialty: "常规咨询 · 报告解读", years: 8, online: true, isAssistant: true, avatarBg: "bg-emerald-100 text-emerald-700", qr: "张医生 · 助理组企微" },
  { id: "d4", name: "陈明", role: "doctor", title: "主治医师", dept: "康复医学科", hospital: "南京市鼓楼医院", specialty: "认知训练 / 肢体训练", years: 10, online: false, avatarBg: "bg-amber-100 text-amber-700", qr: "陈医生 · 企业微信" },

  { id: "m1", name: "刘雯", role: "manager", title: "高级健康管理师", dept: "慢病管理中心", hospital: "南京市鼓楼医院", specialty: "饮食 / 运动 / 用药随访", years: 6, online: true, avatarBg: "bg-cyan-100 text-cyan-700", qr: "刘管理师 · 企微群" },
  { id: "m2", name: "赵倩", role: "manager", title: "健康管理师", dept: "小市社区卫生服务中心", hospital: "小市社区", specialty: "居家随访 / 生活方式干预", years: 4, online: true, avatarBg: "bg-rose-100 text-rose-700", qr: "赵管理师 · 企微群" },
  { id: "m3", name: "孙艺", role: "manager", title: "健康管理师", dept: "慢病管理中心", hospital: "南京市鼓楼医院", specialty: "心理疏导 / 依从性", years: 3, online: false, avatarBg: "bg-orange-100 text-orange-700", qr: "孙管理师 · 企微群" },
];

const PatientDoctors = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Role>("doctor");
  const [qrPerson, setQrPerson] = useState<Person | null>(null);

  const list = people.filter((p) => p.role === tab);
  const onlineDoctors = people.filter((p) => p.role === "doctor" && p.online && !p.isAssistant);
  const assistants = people.filter((p) => p.role === "doctor" && p.isAssistant && p.online);

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-3 py-3">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">咨询医生</h1>
        <span className="w-9" />
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-8">
        {/* 提示卡 */}
        {tab === "doctor" && onlineDoctors.length === 0 && assistants.length > 0 && (
          <div className="rounded-2xl bg-amber-50 p-3 text-xs text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
            主诊医生当前不在线,已为您显示 <b>助理医生</b>,可先咨询,主诊医生上线后会同步跟进。
          </div>
        )}

        {/* Tab */}
        <div className="flex rounded-2xl bg-muted p-1">
          {(["doctor", "manager"] as Role[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
                tab === k ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              {k === "doctor" ? "医生" : "健康管理师"}
            </button>
          ))}
        </div>

        {/* 搜索 */}
        <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2 ring-1 ring-border/60">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">搜索姓名 / 科室 / 擅长</span>
        </div>

        <div className="space-y-2">
          {list.map((p) => (
            <div key={p.id} className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border/60">
              <div className="flex items-start gap-3">
                <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${p.avatarBg}`}>
                  <Stethoscope className="h-5 w-5" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-card ${
                      p.online ? "bg-emerald-500" : "bg-muted-foreground/60"
                    }`}
                  >
                    <Circle className="h-1.5 w-1.5 fill-white text-white" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-semibold">{p.name}</p>
                    {p.isAssistant && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[14px] font-medium text-amber-700 dark:bg-amber-950/40">
                        助理医生
                      </span>
                    )}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[14px] font-medium ${
                        p.online ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.online ? "在线" : "离线"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[15.4px] text-muted-foreground">
                    {p.title} · {p.dept}
                  </p>
                  <p className="mt-0.5 text-[15.4px] text-muted-foreground">{p.hospital}</p>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-xl bg-muted/40 p-2 text-[15.4px]">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Award className="h-3 w-3 text-primary" /> 擅长:<span className="text-foreground">{p.specialty}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <GraduationCap className="h-3 w-3 text-primary" /> 从业 {p.years} 年
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                {p.role === "manager" ? (
                  <button
                    onClick={() => navigate("/patient/ai")}
                    className="flex-1 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <MessageCircle className="mr-1 inline h-3.5 w-3.5" /> 立即咨询
                  </button>
                ) : p.online && !p.isAssistant ? (
                  <button
                    onClick={() => navigate("/patient/ai")}
                    className="flex-1 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <MessageCircle className="mr-1 inline h-3.5 w-3.5" /> 立即咨询
                  </button>
                ) : (
                  <button
                    onClick={() => setQrPerson(p)}
                    className="flex-1 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <MessageCircle className="mr-1 inline h-3.5 w-3.5" /> 联系医生助理
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 二维码弹窗 */}
      {qrPerson && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-6" onClick={() => setQrPerson(null)}>
          <div
            className="w-full max-w-[280px] rounded-2xl bg-card p-4 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{qrPerson.qr}</span>
              <button onClick={() => setQrPerson(null)} className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Fake QR */}
            <div className="mx-auto mt-3 grid h-48 w-48 grid-cols-16 gap-px overflow-hidden rounded-lg bg-white p-2 ring-1 ring-border">
              {Array.from({ length: 256 }).map((_, i) => (
                <span
                  key={i}
                  className={`block ${((i * 7 + (i % 5) * 3) % 3 === 0) ? "bg-foreground" : "bg-transparent"}`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              使用<b className="text-foreground">企业微信</b>扫一扫,添加 {qrPerson.name} 的 1v1 咨询
            </p>
            <div className="mt-2 flex items-center justify-center gap-1 text-[15.4px] text-primary">
              <HeartPulse className="h-3 w-3" /> {qrPerson.hospital} · {qrPerson.dept}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;
