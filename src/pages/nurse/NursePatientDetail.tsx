import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, MessageSquare, Phone, Users as UsersIcon, FileText,
  Stethoscope, TrendingUp, CheckCircle2, AlertCircle,
  Utensils, Dumbbell, Pill, Moon, Droplets,
  Send, Building2, ClipboardCheck, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ActionSheet from "@/components/nurse/ActionSheet";
import { eduByCategory } from "@/data/education";
import { doctorPatients, planRecordsByPatient, type DoctorPatient } from "@/data/doctorMock";

const CONSULT_DOCTORS = [
  { id: "d1", name: "王主任", dept: "神经内科", cross: false },
  { id: "d2", name: "李思远", dept: "神经内科", cross: false },
  { id: "d3", name: "陈慧", dept: "神经内科", cross: false },
  { id: "d4", name: "刘康", dept: "康复医学科", cross: true },
  { id: "d5", name: "赵敏", dept: "心血管内科", cross: true },
  { id: "d6", name: "孙毅", dept: "内分泌科", cross: true },
];
const XUANWU_COMMUNITIES = [
  "兰园社区卫生服务中心", "梅园新村社区卫生服务中心", "锁金村社区卫生服务中心",
  "红山街道社区卫生服务中心", "玄武门街道社区卫生服务中心", "新街口街道社区卫生服务中心",
  "孝陵卫街道社区卫生服务中心",
];

// nurse patient list uses ids "1"/"2"; align to doctorPatients p1..p6
const resolvePatient = (id: string): DoctorPatient => {
  if (id.startsWith("p")) return doctorPatients.find((x) => x.id === id) ?? doctorPatients[0];
  const idx = Math.max(0, (Number(id) || 1) - 1);
  return doctorPatients[idx % doctorPatients.length];
};

const flagTone = (flag?: string) => {
  if (!flag) return "";
  if (flag === "正常") return "bg-success/15 text-success";
  if (flag === "偏高") return "bg-warning/15 text-warning";
  if (flag === "偏低") return "bg-primary/10 text-primary";
  return "bg-destructive/15 text-destructive";
};
const Flag = ({ v }: { v?: string }) =>
  v ? <span className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium ${flagTone(v)}`}>{v}</span> : null;

const NursePatientDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const p = resolvePatient(id);
  const records = useMemo(() => [...(planRecordsByPatient[p.id] ?? [])].reverse(), [p.id]);

  const [expanded, setExpanded] = useState(true);
  const [tab, setTab] = useState<"diet" | "exercise" | "med" | "sleep" | "water">("diet");
  const [pushEduOpen, setPushEduOpen] = useState(false);
  const [selectedEdu, setSelectedEdu] = useState<Set<number>>(new Set());
  const [consultOpen, setConsultOpen] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState<Set<string>>(new Set());
  const [referOpen, setReferOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "push-edu") setPushEduOpen(true);
    if (action === "chat") navigate(`/nurse/chat/patient/${id}`, { replace: true });
  }, [searchParams, id, navigate]);

  const eduGroups = useMemo(() => eduByCategory(), []);
  const toggleEdu = (cid: number) =>
    setSelectedEdu((s) => { const n = new Set(s); n.has(cid) ? n.delete(cid) : n.add(cid); return n; });
  const toggleDoctor = (did: string) =>
    setSelectedDoctors((s) => { const n = new Set(s); n.has(did) ? n.delete(did) : n.add(did); return n; });
  const closePushEdu = () => {
    setPushEduOpen(false);
    if (searchParams.get("action")) { searchParams.delete("action"); setSearchParams(searchParams, { replace: true }); }
  };
  const confirmPushEdu = () => {
    if (selectedEdu.size === 0) return toast({ title: "请选择宣教内容" });
    toast({ title: "宣教推送成功", description: `已向 ${p.name} 推送 ${selectedEdu.size} 条` });
    setSelectedEdu(new Set()); closePushEdu();
  };
  const confirmConsult = () => {
    if (selectedDoctors.size === 0) return toast({ title: "请选择会诊医生" });
    const names = CONSULT_DOCTORS.filter(d => selectedDoctors.has(d.id)).map(d => d.name).join("、");
    toast({ title: "会诊已发起", description: `已邀请 ${names}` });
    setSelectedDoctors(new Set()); setConsultOpen(false);
  };
  const confirmRefer = () => {
    if (!selectedCommunity) return toast({ title: "请选择接收社区" });
    toast({ title: "下转成功", description: `已下转至 ${selectedCommunity}` });
    setSelectedCommunity(null); setReferOpen(false);
  };

  return (
    <div className="bg-muted/30">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-primary">
          <ArrowLeft className="h-4 w-4" /> 返回
        </button>
        <h1 className="text-base font-semibold">{p.name}</h1>
        <span className="w-12" />
      </header>

      <main className="space-y-3 px-3 py-3 pb-6">
        {/* 头像 + 护士操作 */}
        <section className="flex flex-col items-center rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-2xl font-bold text-primary">
            {p.initial}
          </div>
          <p className="mt-3 text-lg font-bold">{p.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{p.strokeType}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">⏱ 建档于 {p.createdAt}</p>

          <div className="mt-4 grid w-full grid-cols-5 gap-2">
            <button onClick={() => navigate(`/nurse/chat/patient/${p.id}`)} className="flex flex-col items-center gap-1.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15">
                <MessageSquare className="h-5 w-5 text-primary" />
              </span>
              <span className="whitespace-nowrap text-[11px] text-primary">沟通</span>
            </button>
            <a href={`tel:${p.phone}`} onClick={() => toast({ title: "正在呼叫", description: p.phone })} className="flex flex-col items-center gap-1.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15">
                <Phone className="h-5 w-5 text-emerald-600" />
              </span>
              <span className="whitespace-nowrap text-[11px] text-emerald-600">电话</span>
            </a>
            <button onClick={() => setConsultOpen(true)} className="flex flex-col items-center gap-1.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-500/15">
                <UsersIcon className="h-5 w-5 text-violet-600" />
              </span>
              <span className="whitespace-nowrap text-[11px] text-violet-600">会诊</span>
            </button>
            <button onClick={() => setPushEduOpen(true)} className="flex flex-col items-center gap-1.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15">
                <Send className="h-5 w-5 text-accent" />
              </span>
              <span className="whitespace-nowrap text-[11px] text-accent">宣教推送</span>
            </button>
            <button onClick={() => setReferOpen(true)} className="flex flex-col items-center gap-1.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success/15">
                <Building2 className="h-5 w-5 text-success" />
              </span>
              <span className="whitespace-nowrap text-[11px] text-success">下转社区</span>
            </button>
          </div>
        </section>

        {/* 患者档案 */}
        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            <FileText className="h-4 w-4" /> 患者档案
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <InfoCell label="姓名" value={p.name} />
            <InfoCell label="性别" value={p.gender} />
            <InfoCell label="年龄" value={`${p.age}岁`} />
            <InfoCell label="身份证号" value={p.idNo} mono />
            <InfoCell label="联系方式" value={p.phone} full mono />
            <InfoCell label="诊断" value={p.strokeType} full />
            {expanded && (
              <>
                <InfoCell label="血压" value={p.vitals.bp} flag={<Flag v={p.vitalsFlags.bp} />} />
                <InfoCell label="心率" value={p.vitals.hr} flag={<Flag v={p.vitalsFlags.hr} />} />
                <InfoCell label="LDL" value={p.vitals.ldl} flag={<Flag v={p.vitalsFlags.ldl} />} />
                <InfoCell label="空腹血糖" value={p.vitals.glucose} flag={<Flag v={p.vitalsFlags.glucose} />} />
                <InfoCell label="NIHSS 评分" value={p.vitals.nihss} flag={<Flag v={p.vitalsFlags.nihss} />} />
                <InfoCell label="mRS 评级" value={p.vitals.mrs} flag={<Flag v={p.vitalsFlags.mrs} />} />
                <InfoCell label="患侧肌力" value={p.vitals.limbPower} full flag={<Flag v={p.vitalsFlags.limbPower} />} />
              </>
            )}
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 w-full whitespace-nowrap rounded-xl bg-primary/10 py-2.5 text-sm font-medium text-primary"
          >
            {expanded ? "收起详情 ˄" : "展开详情 ˅"}
          </button>
        </section>

        {/* 健康风险 */}
        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <h3 className="mb-3 text-sm font-semibold">健康风险</h3>
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-destructive/5 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/15">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">卒中复发风险 · 高</p>
              <p className="text-xs text-muted-foreground">
                ESSEN 评分较高,合并 {p.riskTags.slice(0, 2).join("、")}
              </p>
            </div>
          </div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {p.riskTags.map((t) => (
              <span key={t} className="whitespace-nowrap rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">{t}</span>
            ))}
            {p.lifestyleWarnings.map((t) => (
              <span key={t} className="whitespace-nowrap rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning">{t}</span>
            ))}
          </div>
          <ul className="mt-3 divide-y divide-border text-sm">
            <Row label="血压" value={p.vitals.bp} flag={<Flag v={p.vitalsFlags.bp} />} />
            <Row label="LDL" value={p.vitals.ldl} flag={<Flag v={p.vitalsFlags.ldl} />} />
            <Row label="NIHSS" value={p.vitals.nihss} flag={<Flag v={p.vitalsFlags.nihss} />} />
            <Row label="mRS" value={p.vitals.mrs} flag={<Flag v={p.vitalsFlags.mrs} />} />
            <Row label="患侧肌力" value={p.vitals.limbPower} flag={<Flag v={p.vitalsFlags.limbPower} />} />
          </ul>
        </section>

        {/* 当前健康方案 · 用药 */}
        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            <Stethoscope className="h-4 w-4" /> 当前健康方案 · 用药
          </h3>
          <ul className="space-y-2">
            {p.meds.map((m) => (
              <li key={m.name} className="rounded-xl bg-muted/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold">{m.name}</span>
                  <span className="whitespace-nowrap text-[11px] text-muted-foreground">{m.start} ~ {m.end}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{m.freq} · 每次 {m.dose}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">服用天数:{m.days} 天</span>
                  <span className="whitespace-nowrap rounded-md bg-success/15 px-1.5 py-0.5 text-[11px] font-medium text-success">{m.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 健康指标趋势 */}
        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            <TrendingUp className="h-4 w-4" /> 健康指标趋势
          </h3>
          <div className="mb-3 flex gap-2">
            <Chip active>血压</Chip><Chip>LDL</Chip><Chip>NIHSS</Chip>
          </div>
          <p className="text-xs text-muted-foreground">单位:mmHg · 目标范围:&lt;140/90</p>
          <MiniChart values={[168, 162, 158, 160, 155, 158, 162]} min={100} max={180} target={140} />
        </section>

        {/* 生活方式打卡 */}
        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> 生活方式打卡
          </h3>
          <div className="mb-3 flex flex-wrap gap-2">
            <Chip active={tab === "diet"} onClick={() => setTab("diet")} icon={<Utensils className="h-3 w-3" />}>饮食记录</Chip>
            <Chip active={tab === "exercise"} onClick={() => setTab("exercise")} icon={<Dumbbell className="h-3 w-3" />}>运动记录</Chip>
            <Chip active={tab === "med"} onClick={() => setTab("med")} icon={<Pill className="h-3 w-3" />}>用药</Chip>
            <Chip active={tab === "sleep"} onClick={() => setTab("sleep")} icon={<Moon className="h-3 w-3" />}>睡眠</Chip>
            <Chip active={tab === "water"} onClick={() => setTab("water")} icon={<Droplets className="h-3 w-3" />}>饮水</Chip>
          </div>
          <CheckinPanel tab={tab} patient={p} />
        </section>

        {/* 方案记录 */}
        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-warning">
            <ClipboardCheck className="h-4 w-4" /> 方案记录 ({records.length})
          </h3>
          {records.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">暂无方案记录</p>
          ) : (
            <ul className="divide-y divide-border">
              {records.map((r) => (
                <li key={r.id} className="flex items-start gap-3 py-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning/15">
                    <FileText className="h-4 w-4 text-warning" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{r.disease}</span>
                      <span className={`shrink-0 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                        r.status === "进行中" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                      }`}>{r.status}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{r.department} · {r.time}</p>
                    {r.note && <p className="mt-1 text-xs text-warning">💬 {r.note}</p>}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* 宣教推送 */}
      <ActionSheet
        open={pushEduOpen}
        onOpenChange={(v) => (v ? setPushEduOpen(true) : closePushEdu())}
        title="宣教推送"
        description={`向 ${p.name} 推送宣教 · 已选 ${selectedEdu.size} 条`}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={closePushEdu}>取消</Button>
            <Button className="bg-gradient-nurse" onClick={confirmPushEdu}>
              <Send className="mr-1 h-4 w-4" />确认推送
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          {Object.entries(eduGroups).map(([cat, items]) => (
            <div key={cat}>
              <div className="mb-1.5 text-xs font-semibold text-muted-foreground">{cat}</div>
              <div className="space-y-1.5">
                {items.map((c) => {
                  const checked = selectedEdu.has(c.id);
                  return (
                    <label key={c.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-2.5 text-xs transition-colors ${checked ? "border-accent bg-accent/5" : ""}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleEdu(c.id)} className="mt-0.5 h-4 w-4 accent-accent" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c.title}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{c.desc} · {c.duration}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ActionSheet>

      {/* 会诊 */}
      <ActionSheet
        open={consultOpen}
        onOpenChange={setConsultOpen}
        title="发起会诊"
        description={`选择同科室 / 跨科室医生 · 已选 ${selectedDoctors.size} 位`}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setConsultOpen(false)}>取消</Button>
            <Button className="bg-gradient-nurse" onClick={confirmConsult}>
              <UsersIcon className="mr-1 h-4 w-4" />发起会诊
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          {["同科室 · 神经内科", "跨科室"].map((cat) => {
            const list = CONSULT_DOCTORS.filter(d => (cat.includes("同科室") ? !d.cross : d.cross));
            return (
              <div key={cat}>
                <div className="mb-1.5 text-xs font-semibold text-muted-foreground">{cat}</div>
                <div className="space-y-1.5">
                  {list.map((d) => {
                    const checked = selectedDoctors.has(d.id);
                    return (
                      <label key={d.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 text-sm transition-colors ${checked ? "border-primary bg-primary/5" : ""}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleDoctor(d.id)} className="h-4 w-4 accent-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{d.name}</p>
                          <p className="text-[11px] text-muted-foreground">{d.dept}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ActionSheet>

      {/* 下转社区 */}
      <ActionSheet
        open={referOpen}
        onOpenChange={setReferOpen}
        title="下转至社区"
        description="南京市玄武区 · 社区卫生服务中心"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setReferOpen(false)}>取消</Button>
            <Button className="bg-gradient-nurse" onClick={confirmRefer}>
              <Building2 className="mr-1 h-4 w-4" />确认下转
            </Button>
          </div>
        }
      >
        <div className="space-y-1.5 py-2">
          {XUANWU_COMMUNITIES.map((c) => {
            const checked = selectedCommunity === c;
            return (
              <label key={c}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${checked ? "border-success bg-success/5" : ""}`}>
                <input type="radio" name="community" checked={checked} onChange={() => setSelectedCommunity(c)} className="h-4 w-4 accent-success" />
                <span className="flex-1 text-sm font-medium">{c}</span>
              </label>
            );
          })}
        </div>
      </ActionSheet>
    </div>
  );
};

function InfoCell({ label, value, full, mono, flag }: { label: string; value: string; full?: boolean; mono?: boolean; flag?: React.ReactNode }) {
  return (
    <div className={`rounded-xl bg-muted/50 p-3 ${full ? "col-span-2" : ""}`}>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <div className="mt-0.5 flex items-center gap-2">
        <span className={`text-sm font-semibold ${mono ? "font-mono" : ""}`}>{value}</span>
        {flag}
      </div>
    </div>
  );
}
function Row({ label, value, flag }: { label: string; value: string; flag?: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{value}</span>
        {flag}
      </div>
    </li>
  );
}
function Chip({ active, onClick, icon, children }: { active?: boolean; onClick?: () => void; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}>
      {icon}{children}
    </button>
  );
}
function MiniChart({ values, min, max, target }: { values: number[]; min: number; max: number; target: number }) {
  const w = 320, h = 120, pad = 24;
  const stepX = (w - pad * 2) / (values.length - 1);
  const scaleY = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const points = values.map((v, i) => `${pad + i * stepX},${scaleY(v)}`).join(" ");
  const targetY = scaleY(target);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full">
      <line x1={pad} y1={targetY} x2={w - pad} y2={targetY} className="stroke-destructive" strokeDasharray="4 3" strokeWidth="1" opacity="0.7" />
      <text x={w - pad} y={targetY - 4} textAnchor="end" className="fill-destructive" style={{ fontSize: 10 }}>目标 {target}</text>
      <polyline points={points} fill="none" className="stroke-primary" strokeWidth="2" />
      {values.map((v, i) => (
        <circle key={i} cx={pad + i * stepX} cy={scaleY(v)} r="3" fill="white" className="stroke-primary" strokeWidth="1.5" />
      ))}
    </svg>
  );
}
function CheckinPanel({ tab, patient }: { tab: string; patient: DoctorPatient }) {
  const c = patient.checkins;
  const map: Record<string, { title: string; value: string; hint: string; goal: string; pct: number }> = {
    diet:     { title: "每日热量", value: `${c.diet} kcal`, hint: "低盐低脂饮食", goal: "目标 1800 kcal", pct: Math.min(100, (c.diet / 1800) * 100) },
    exercise: { title: "运动时长", value: `${c.exercise} 分钟`, hint: "有氧+康复训练", goal: "目标 30 分钟", pct: Math.min(100, (c.exercise / 30) * 100) },
    med:      { title: "服药依从性", value: `${c.medAdherence}%`, hint: "抗血小板/降压/他汀", goal: "目标 ≥ 95%", pct: c.medAdherence },
    sleep:    { title: "睡眠时长", value: `${c.sleep} 小时`, hint: "夜间连续睡眠", goal: "目标 7 小时", pct: Math.min(100, (c.sleep / 7) * 100) },
    water:    { title: "饮水量", value: "1400 ml", hint: "分次饮水", goal: "目标 1600 ml", pct: 88 },
  };
  const d = map[tab];
  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-muted-foreground">{d.title}</p>
        <p className="text-xs text-muted-foreground">{d.goal}</p>
      </div>
      <p className="mt-1 text-2xl font-semibold text-foreground">{d.value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{d.hint}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${d.pct}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {["一", "二", "三", "四", "五", "六", "日"].map((day, i) => (
          <div key={day} className="text-center">
            <div className={`mx-auto h-8 w-full rounded ${i < 5 ? "bg-primary/30" : "bg-muted"}`} />
            <p className="mt-1 text-[10px] text-muted-foreground">{day}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">近 7 天打卡:5/7 天</p>
    </div>
  );
}

export default NursePatientDetail;
