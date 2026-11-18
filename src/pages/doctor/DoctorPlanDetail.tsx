import { useMemo, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { planReviews, doctorPatients } from "@/data/doctorMock";
import {
  ChevronLeft, User, AlertCircle, Utensils, Dumbbell, Pill, Moon, Droplets,
  Mic, Edit3, CheckCircle2, MessageSquare, UsersIcon,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ModuleKey = "overview" | "diet" | "exercise" | "sleep" | "water" | "monitor" | "mood";
const MODULES: { key: ModuleKey; label: string; icon: any; color: string; bg: string }[] = [
  { key: "overview", label: "方案总述", icon: Pill, color: "text-primary", bg: "bg-primary/10" },
  { key: "diet", label: "饮食建议", icon: Utensils, color: "text-emerald-600", bg: "bg-emerald-500/15" },
  { key: "exercise", label: "运动建议", icon: Dumbbell, color: "text-amber-600", bg: "bg-amber-500/15" },
  { key: "water", label: "饮水建议", icon: Droplets, color: "text-sky-600", bg: "bg-sky-500/15" },
  { key: "sleep", label: "睡眠建议", icon: Moon, color: "text-violet-600", bg: "bg-violet-500/15" },
  { key: "monitor", label: "监测建议", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-500/15" },
  { key: "mood", label: "情绪管理", icon: MessageSquare, color: "text-cyan-600", bg: "bg-cyan-500/15" },
];

const defaultContent = (name: string): Record<ModuleKey, string> => ({
  overview: `根据 ${name} 的健康数据,评估为认知障碍干预重点人群(血压偏高、LDL 未达标、久坐少动),同时存在多重生活方式风险:每日体力活动以卧床/久坐为主,每周规律运动频率为 0,饮水量不足(1000-1500ml),饮食不规律,奶制品基本不摄入,口味偏咸,排便不规律,睡眠时长仅 5-7 小时,虽睡眠质量正常但入睡延迟(12 点-2 点)。中医体质提示存在轻度阳虚与气滞倾向(怕冷、怕凉、易感寒)。建议立即从以下六个维度进行生活方式干预,持续 3 个月并配合定期复诊,可延缓认知衰退。`,
  diet: `三餐定时,早餐必吃,以清淡少盐、低脂为原则。每日食盐 <5g、烹调油 <25g;每日蔬菜 ≥500g,新鲜水果 200g;主食以全谷物为主(如燕麦、糙米)搭配豆类;每日增加低脂奶制品(如 250ml 脱脂牛奶);减少辛辣刺激及腌制、油炸食品;戒掉外卖,以自炊为主。`,
  exercise: `以循序渐进为原则,从每日散步 15 分钟开始,逐步增加至 30 分钟,每周 5 天,避免久卧。饭后 1 小时进行轻度活动;每周可安排 2 次下肢为主的轻度抗阻训练;运动过程中心率控制在自我耐受范围内,如出现头晕、胸闷需立即停止。`,
  water: `每日饮水量增加至 2000ml,少量多次饮用;晨起空腹温水一杯(约 200ml);餐前 30 分钟适量饮水;避免一次性大量饮水,避免含糖饮料。`,
  sleep: `固定 23 点前入睡,保证 7-8 小时睡眠;睡前 1 小时避免使用电子设备;营造黑暗、安静的睡眠环境;午间可小憩 20-30 分钟,避免过长。`,
  monitor: `每日早晚各测量血压 1 次并记录;每周固定时间自测体重 1 次;记录每日饮食与排便情况;建议 1 个月内复查血脂、血糖、同型半胱氨酸;如出现头晕、肢体无力、言语不清等,立即就医。`,
  mood: `每日 5 分钟深呼吸或冥想,缓解焦虑;避免久坐带来的情绪压抑;鼓励家属陪伴与社交活动;以上调整需坚持 3 个月,并配合医生每月 1 次复诊,系统将根据打卡数据动态优化方案。`,
});

const DoctorPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const review = planReviews.find((r) => r.id === id);
  const patient = review ? doctorPatients.find((p) => p.id === review.patientId) : undefined;

  const initial = useMemo(() => defaultContent(review?.patientName ?? ""), [review?.patientName]);
  const [contents, setContents] = useState<Record<ModuleKey, string>>(initial);
  const [editing, setEditing] = useState<ModuleKey | null>(null);
  const [note, setNote] = useState("");
  const [consult, setConsult] = useState("建议邀请康复医学科刘康主任协同评估上肢功能。");

  if (!review || !patient) return <Navigate to="/doctor/plans" replace />;

  const startVoice = (key: ModuleKey) => {
    toast({ title: "语音输入", description: `正在为「${MODULES.find(m => m.key === key)?.label}」录音…（示例）` });
  };
  const approve = () => {
    toast({ title: "方案已提交", description: `${review.patientName} · ${review.disease}` });
    navigate(-1);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-primary">
          <ChevronLeft className="h-5 w-5" /> 返回
        </button>
        <h1 className="text-base font-semibold">方案审核</h1>
        <span className="w-12" />
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto px-4 py-3 pb-24">
        {/* 患者基本信息 */}
        <button
          onClick={() => navigate(`/doctor/patients/${patient.id}`)}
          className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-border/60"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
            {patient.initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold">{patient.name}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {patient.gender} · {patient.age}岁 · {patient.strokeType}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">提交于 {review.submittedAt}</p>
          </div>
          <User className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* 风险 & 评估 */}
        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive">
            <AlertCircle className="h-4 w-4" /> 风险 & 评估
          </h3>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {patient.riskTags.map((t) => (
              <span key={t} className="whitespace-nowrap rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">{t}</span>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{review.summary}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <MiniKV k="血压" v={patient.vitals.bp} />
            <MiniKV k="LDL" v={patient.vitals.ldl} />
            <MiniKV k="MMSE" v={patient.vitals.nihss} />
            <MiniKV k="MoCA" v={patient.vitals.mrs} />
          </div>
        </section>

        {/* AI 生成方案（分模块） */}
        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">AI 生成健康方案</h3>
            <span className="whitespace-nowrap rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">可编辑 / 语音输入</span>
          </div>
          <ul className="space-y-3">
            {MODULES.map((m) => {
              const isEdit = editing === m.key;
              return (
                <li key={m.key} className="rounded-xl bg-muted/50 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${m.bg}`}>
                      <m.icon className={`h-4 w-4 ${m.color}`} />
                    </span>
                    <span className="flex-1 text-sm font-semibold">{m.label}</span>
                    <button
                      onClick={() => startVoice(m.key)}
                      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-card px-2 py-1 text-[11px] ring-1 ring-border"
                    >
                      <Mic className="h-3 w-3" /> 语音
                    </button>
                    <button
                      onClick={() => setEditing(isEdit ? null : m.key)}
                      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-card px-2 py-1 text-[11px] ring-1 ring-border"
                    >
                      <Edit3 className="h-3 w-3" /> {isEdit ? "完成" : "编辑"}
                    </button>
                  </div>
                  {isEdit ? (
                    <textarea
                      value={contents[m.key]}
                      onChange={(e) => setContents({ ...contents, [m.key]: e.target.value })}
                      rows={6}
                      className="w-full resize-none rounded-lg bg-card p-2 text-xs leading-relaxed outline-none ring-1 ring-border"
                    />
                  ) : (
                    <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{contents[m.key]}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* 备注 & 会诊建议 */}
        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="h-4 w-4 text-primary" /> 医生备注
          </h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="补充说明、注意事项…"
            className="mb-4 w-full resize-none rounded-xl bg-muted/50 p-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <UsersIcon className="h-4 w-4 text-violet-600" /> 会诊建议
          </h3>
          <textarea
            value={consult}
            onChange={(e) => setConsult(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl bg-muted/50 p-3 text-sm outline-none"
          />
        </section>
      </main>

      <div className="sticky bottom-0 border-t bg-card px-4 py-3">
        <button onClick={approve} className="inline-flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground">
          <CheckCircle2 className="h-4 w-4" /> 提交
        </button>
      </div>
    </div>
  );
};

function MiniKV({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2">
      <p className="text-muted-foreground">{k}</p>
      <p className="mt-0.5 font-semibold text-foreground">{v}</p>
    </div>
  );
}

export default DoctorPlanDetail;
