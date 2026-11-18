import { useState } from "react";
import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { doctorPatients, planRecordsByPatient, type DoctorPatient } from "@/data/doctorMock";
import {
  FileText, Stethoscope, TrendingUp, CheckCircle2, AlertCircle,
  Utensils, Dumbbell, Pill, Moon, Droplets,
  MessageSquare, PhoneCall, Users as UsersIcon, ClipboardCheck, ChevronRight, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ActionSheet from "@/components/nurse/ActionSheet";

const DOCTOR_CONSULT_LIST = [
  { id: "d1", name: "王主任", dept: "神经内科", cross: false },
  { id: "d2", name: "陈慧", dept: "神经内科", cross: false },
  { id: "d3", name: "周敏", dept: "神经内科", cross: false },
  { id: "d4", name: "刘康", dept: "康复医学科", cross: true },
  { id: "d5", name: "赵敏", dept: "心血管内科", cross: true },
  { id: "d6", name: "孙毅", dept: "内分泌科", cross: true },
];

const DoctorPatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = doctorPatients.find((p) => p.id === id);
  const [expanded, setExpanded] = useState(true);
  const [tab, setTab] = useState<"diet" | "exercise" | "med" | "sleep" | "water">("diet");
  const [consultOpen, setConsultOpen] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState<Set<string>>(new Set());

  if (!patient) return <Navigate to="/doctor/patients" replace />;
  const records = [...(planRecordsByPatient[patient.id] ?? [])].reverse();

  const toggleDoctor = (did: string) =>
    setSelectedDoctors((s) => {
      const n = new Set(s);
      n.has(did) ? n.delete(did) : n.add(did);
      return n;
    });
  const confirmConsult = () => {
    if (selectedDoctors.size === 0) { toast({ title: "请选择会诊医生" }); return; }
    const names = DOCTOR_CONSULT_LIST.filter(d => selectedDoctors.has(d.id)).map(d => d.name).join("、");
    toast({ title: "会诊已发起", description: `已邀请 ${names}` });
    setSelectedDoctors(new Set());
    setConsultOpen(false);
  };


  const flagBadge = (flag?: string) => {
    if (!flag) return null;
    const cls =
      flag === "正常" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      : flag === "偏高" ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
      : flag === "偏低" ? "bg-primary/10 text-primary"
      : "bg-destructive/15 text-destructive";
    return <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${cls}`}>{flag}</span>;
  };

  return (
    <div>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-primary">
          <ChevronLeft className="h-5 w-5" /> 返回
        </button>
        <h1 className="text-base font-semibold">{patient.name}</h1>
        <span className="w-12" />
      </header>

      <main className="space-y-3 px-4 py-3 pb-6">
        {/* 患者头像 + 操作 */}
        <section className="flex flex-col items-center rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-2xl font-bold text-primary">
            {patient.initial}
          </div>
          <p className="mt-3 text-lg font-bold">{patient.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{patient.strokeType}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">⏱ 建档于 {patient.createdAt}</p>
          <div className="mt-4 grid w-full grid-cols-4 gap-2">
            <Link to={`/doctor/chat/${patient.id}`} className="flex flex-col items-center gap-1.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15">
                <MessageSquare className="h-5 w-5 text-primary" />
              </span>
              <span className="text-[11px] text-primary">沟通</span>
            </Link>
            <a href={`tel:${patient.phone}`} onClick={() => toast({ title: "正在呼叫", description: patient.phone })} className="flex flex-col items-center gap-1.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15">
                <PhoneCall className="h-5 w-5 text-emerald-600" />
              </span>
              <span className="text-[11px] text-emerald-600">电话</span>
            </a>
            <button onClick={() => setConsultOpen(true)} className="flex flex-col items-center gap-1.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-500/15">
                <UsersIcon className="h-5 w-5 text-violet-600" />
              </span>
              <span className="text-[11px] text-violet-600">会诊</span>
            </button>
            <button onClick={() => navigate("/doctor/plans")} className="flex flex-col items-center gap-1.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/15">
                <ClipboardCheck className="h-5 w-5 text-amber-600" />
              </span>
              <span className="text-[11px] text-amber-600">方案审核</span>
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">

          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            <FileText className="h-4 w-4" /> 患者档案
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <InfoCell label="姓名" value={patient.name} />
            <InfoCell label="性别" value={patient.gender} />
            <InfoCell label="年龄" value={`${patient.age}岁`} />
            <InfoCell label="身份证号" value={patient.idNo} mono />
            <InfoCell label="联系方式" value={patient.phone} full mono />
            <InfoCell label="诊断" value={patient.strokeType} full />
            {expanded && (
              <>
                <InfoCell label="血压" value={patient.vitals.bp} flag={flagBadge(patient.vitalsFlags.bp)} />
                <InfoCell label="心率" value={patient.vitals.hr} flag={flagBadge(patient.vitalsFlags.hr)} />
                <InfoCell label="LDL" value={patient.vitals.ldl} flag={flagBadge(patient.vitalsFlags.ldl)} />
                <InfoCell label="空腹血糖" value={patient.vitals.glucose} flag={flagBadge(patient.vitalsFlags.glucose)} />
                <InfoCell label="NIHSS 评分" value={patient.vitals.nihss} flag={flagBadge(patient.vitalsFlags.nihss)} />
                <InfoCell label="mRS 评级" value={patient.vitals.mrs} flag={flagBadge(patient.vitalsFlags.mrs)} />
                <InfoCell label="患侧肌力" value={patient.vitals.limbPower} full flag={flagBadge(patient.vitalsFlags.limbPower)} />
              </>
            )}
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 w-full rounded-xl bg-primary/10 py-2.5 text-sm font-medium text-primary"
          >
            {expanded ? "收起详情 ˄" : "展开详情 ˅"}
          </button>
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <h3 className="mb-3 text-sm font-semibold">健康风险</h3>
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-destructive/5 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/15">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">卒中复发风险 · 高</p>
              <p className="text-xs text-muted-foreground">
                ESSEN 评分较高，合并 {patient.riskTags.slice(0, 2).join("、")}
              </p>
            </div>
          </div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {patient.riskTags.map((t) => (
              <span key={t} className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">{t}</span>
            ))}
            {patient.lifestyleWarnings.map((t) => (
              <span key={t} className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">{t}</span>
            ))}
          </div>
          <ul className="mt-3 divide-y divide-border text-sm">
            <Row label="血压" value={patient.vitals.bp} flag={flagBadge(patient.vitalsFlags.bp)} />
            <Row label="LDL" value={patient.vitals.ldl} flag={flagBadge(patient.vitalsFlags.ldl)} />
            <Row label="NIHSS" value={patient.vitals.nihss} flag={flagBadge(patient.vitalsFlags.nihss)} />
            <Row label="mRS" value={patient.vitals.mrs} flag={flagBadge(patient.vitalsFlags.mrs)} />
            <Row label="患侧肌力" value={patient.vitals.limbPower} flag={flagBadge(patient.vitalsFlags.limbPower)} />
          </ul>
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            <Stethoscope className="h-4 w-4" /> 当前健康方案 · 用药
          </h3>
          <ul className="space-y-2">
            {patient.meds.map((m) => (
              <li key={m.name} className="rounded-xl bg-muted/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold">{m.name}</span>
                  <span className="text-[11px] text-muted-foreground">{m.start} ～ {m.end}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{m.freq} · 每次 {m.dose}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">服用天数：{m.days} 天</span>
                  <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">{m.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            <TrendingUp className="h-4 w-4" /> 健康指标趋势
          </h3>
          <div className="mb-3 flex gap-2">
            <Chip active>血压</Chip>
            <Chip>LDL</Chip>
            <Chip>NIHSS</Chip>
          </div>
          <p className="text-xs text-muted-foreground">单位：mmHg · 目标范围：&lt;140/90</p>
          <MiniChart values={[168, 162, 158, 160, 155, 158, 162]} min={100} max={180} target={140} />
        </section>

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
          <CheckinPanel tab={tab} patient={patient} />
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
            <ClipboardCheck className="h-4 w-4" /> 方案记录 ({records.length})
          </h3>
          {records.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">暂无方案记录</p>
          ) : (
            <ul className="divide-y divide-border">
              {records.map((r) => (
                <li key={r.id} className="flex items-start gap-3 py-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15">
                    <FileText className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{r.disease}</span>
                      <span className={`shrink-0 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                        r.status === "进行中" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{r.department} · {r.time}</p>
                    {r.note ? <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">💬 {r.note}</p> : null}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          )}
        </section>

      </main>

      <ActionSheet
        open={consultOpen}
        onOpenChange={setConsultOpen}
        title="发起会诊"
        description={`选择同科室 / 跨科室医生 · 已选 ${selectedDoctors.size} 位`}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setConsultOpen(false)}>取消</Button>
            <Button onClick={confirmConsult}>
              <UsersIcon className="mr-1 h-4 w-4" />发起会诊
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          {["同科室 · 神经内科", "跨科室"].map((cat) => {
            const list = DOCTOR_CONSULT_LIST.filter(d => (cat.includes("同科室") ? !d.cross : d.cross));
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
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}
    >
      {icon}
      {children}
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
      <p className="mt-2 text-[11px] text-muted-foreground">近 7 天打卡：5/7 天</p>
    </div>
  );
}

export default DoctorPatientDetail;
