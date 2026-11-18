import type { ReactNode } from "react";
import { AlertTriangle, ArrowLeftRight, Brain, Building2, CalendarCheck, CheckCircle2, ClipboardCheck, Clock, Dumbbell, MapPin, Stethoscope, UserCheck, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { C, Legend, Panel, axis, tip } from "./screenKit";
import { usePatients } from "@/data/patients";

function KpiStrip({ items }: { items: { label: string; value: string; unit?: string; sub: string; icon: typeof Users; warn?: boolean }[] }) {
  return (
    <section className="scr-panel grid grid-cols-6 divide-x divide-scr-line/30 py-3">
      {items.map(({ label, value, unit, sub, icon: I, warn }) => (
        <div key={label} className="flex items-center justify-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-scr-cyan/60 bg-scr-line/30"><I className="h-7 w-7 text-scr-cyan" /></span>
          <div>
            <div className="text-sm text-scr-dim">{label}</div>
            <div className={`text-2xl font-black ${warn ? "text-scr-red" : "text-scr-gold"}`}>{value}{unit && <span className="ml-1 text-sm font-normal text-scr-text">{unit}</span>}</div>
            <div className="text-xs text-scr-dim">{sub}</div>
          </div>
        </div>
      ))}
    </section>
  );
}

function Bar100({ label, v, target, suffix = "%" }: { label: string; v: number; target?: number; suffix?: string }) {
  const ok = target === undefined || v >= target;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs"><span className="text-scr-dim">{label}{target !== undefined && <span className="ml-1">（标准≥{target}{suffix}）</span>}</span><b className={ok ? "text-scr-green" : "text-scr-red"}>{v}{suffix}</b></div>
      <div className="h-2 rounded-full bg-scr-line/20"><div className="h-full rounded-full" style={{ width: `${Math.min(v, 100)}%`, background: ok ? C.green : C.red }} /></div>
    </div>
  );
}

const Badge = ({ ok, children }: { ok: boolean; children: ReactNode }) => (
  <span className={`rounded px-1.5 py-0.5 text-[11px] ${ok ? "bg-scr-green/20 text-scr-green" : "bg-scr-red/20 text-scr-red"}`}>{children}</span>
);

/* ===================== 市级：市卫健委 / 市级指导中心 ===================== */
const DISTRICTS = ["玄武区", "秦淮区", "建邺区", "鼓楼区", "浦口区", "栖霞区", "雨花台区", "江宁区", "六合区", "溧水区", "高淳区"];
const TOUR = DISTRICTS.map((d, i) => ({ d: d.replace("区", ""), plan: [4, 4, 2, 6, 4, 4, 2, 6, 4, 4, 4][i], done: [4, 3, 2, 6, 3, 4, 2, 5, 2, 3, 4][i] }));
const QC = DISTRICTS.map((d, i) => ({
  d, screen: [94.0, 93.2, 94.5, 95.1, 92.6, 93.0, 93.8, 93.4, 88.6, 92.4, 92.8][i],
  guide: [92.5, 92.0, 93.0, 93.6, 91.4, 91.8, 92.2, 92.0, 87.9, 91.2, 91.6][i],
  visit: [88.2, 86.5, 90.1, 91.3, 84.2, 86.0, 87.4, 86.9, 81.5, 85.6, 86.3][i],
  cert: [100, 100, 100, 100, 75, 100, 100, 83, 50, 100, 75][i],
}));
const FUNNEL = [{ k: "接收上转", v: 312 }, { k: "完成专科评估", v: 296 }, { k: "明确诊断", v: 270 }, { k: "制定治疗方案", v: 262 }, { k: "下转回站接续", v: 238 }];
const DIAG = [{ name: "SCD", v: 58 }, { name: "MCI", v: 112 }, { name: "轻度痴呆", v: 54 }, { name: "中重度痴呆", v: 28 }, { name: "血管性痴呆", v: 18 }];
const DIAG_C = [C.blue, C.cyan, C.green, C.gold, C.red];
const EXPERTS = [
  { n: "李思远", t: "神经内科 主任医师", st: "小市社区", d: "11-19 周三" },
  { n: "王慧", t: "老年医学科 副主任医师", st: "江宁东山", d: "11-20 周四" },
  { n: "陈立", t: "精神心理科 主治医师", st: "六合雄州", d: "11-21 周五" },
  { n: "周敏", t: "神经内科 副主任医师", st: "浦口江浦", d: "11-25 周二" },
];
const CONSULT = [
  { k: "刘美琳 76岁 · 疑似轻度痴呆伴精神行为症状", from: "鼓楼小市站", t: "待会诊" },
  { k: "早发型认知下降 61岁 · MoCA 18", from: "六合雄州站", t: "已排期 11-20" },
  { k: "帕金森叠加认知障碍 · 跌倒 2 次", from: "江宁东山站", t: "待会诊" },
];

export function CityView({ map, area }: { map: ReactNode; area: string }) {
  const sel = QC.find((q) => q.d === area);
  return (
    <>
      <KpiStrip items={[
        { label: "辖区训练站", value: "22", unit: "个", sub: "11 个区县全覆盖", icon: Building2 },
        { label: "本月专家驻点", value: "38", unit: "次", sub: "标准 每站每月 1-2 次", icon: Stethoscope },
        { label: "接收上转", value: "312", unit: "人", sub: "本年累计", icon: ArrowLeftRight },
        { label: "确诊率", value: "86.5%", sub: "270 / 312", icon: Brain },
        { label: "平均确诊时长", value: "4.2", unit: "天", sub: "上转至出具诊断", icon: Clock },
        { label: "疑似就诊率", value: "86.9%", sub: "标准 ≥85%", icon: CheckCircle2 },
      ]} />
      <div className="grid grid-cols-[1fr_1.6fr_1fr] gap-3">
        <div className="flex flex-col gap-3">
          <Panel title="巡回指导完成情况" sub="(本月驻点次数)" className="h-64">
            <div className="flex h-full flex-col">
              <Legend items={[{ k: "计划", c: C.blue }, { k: "完成", c: C.green }]} />
              <div className="min-h-0 flex-1"><ResponsiveContainer>
                <BarChart data={TOUR} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke={C.grid} vertical={false} /><XAxis dataKey="d" {...axis} interval={0} /><YAxis {...axis} /><Tooltip {...tip} />
                  <Bar dataKey="plan" name="计划" fill={C.blue} barSize={8} /><Bar dataKey="done" name="完成" fill={C.green} barSize={8} />
                </BarChart>
              </ResponsiveContainer></div>
            </div>
          </Panel>
          <Panel title="专家驻点排班" sub="(未来一周)">
            <ul className="divide-y divide-scr-line/25 text-sm">
              {EXPERTS.map((e) => (
                <li key={e.n} className="flex items-center gap-2 py-2">
                  <UserCheck className="h-4 w-4 text-scr-cyan" />
                  <div className="flex-1"><b>{e.n}</b><span className="ml-2 text-xs text-scr-dim">{e.t}</span></div>
                  <span className="text-xs">{e.st}</span><span className="w-20 text-right text-xs text-scr-gold">{e.d}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="人员培训考核" sub="(评估师/治疗管理师)">
            <div className="space-y-2.5">
              <Bar100 label="评估师持证上岗率" v={93.2} target={100} />
              <Bar100 label="治疗管理师持证上岗率" v={88.6} target={100} />
              <Bar100 label="年度复训完成率" v={76.4} target={90} />
            </div>
          </Panel>
        </div>

        {map}

        <div className="flex flex-col gap-3">
          <Panel title="上转确诊闭环" sub="(本年)">
            <div className="space-y-1.5">
              {FUNNEL.map((f, i) => (
                <div key={f.k} className="flex items-center gap-2 text-sm">
                  <span className="w-24 text-scr-dim">{f.k}</span>
                  <div className="h-6 flex-1 rounded bg-scr-line/15">
                    <div className="flex h-full items-center justify-end rounded pr-2 text-xs font-bold" style={{ width: `${(f.v / 312) * 100}%`, background: `linear-gradient(90deg, transparent, ${[C.blue, C.cyan, C.green, C.gold, C.purple][i]})` }}>{f.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="确诊构成" sub="(N=270)" className="h-48">
            <div className="flex h-full items-center">
              <div className="h-full w-1/2"><ResponsiveContainer><PieChart>
                <Pie data={DIAG} dataKey="v" innerRadius="55%" outerRadius="90%" stroke="none">{DIAG.map((_, i) => <Cell key={i} fill={DIAG_C[i]} />)}</Pie><Tooltip {...tip} />
              </PieChart></ResponsiveContainer></div>
              <ul className="flex-1 space-y-1 text-xs">{DIAG.map((d, i) => <li key={d.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: DIAG_C[i] }} />{d.name}<b className="ml-auto">{d.v}</b></li>)}</ul>
            </div>
          </Panel>
          <Panel title="疑难病例会诊" extra={<span className="text-xs text-scr-gold">3 例</span>}>
            <ul className="divide-y divide-scr-line/25 text-sm">
              {CONSULT.map((c) => (
                <li key={c.k} className="py-2"><p>{c.k}</p><p className="flex justify-between text-xs text-scr-dim"><span>{c.from}</span><span className={c.t === "待会诊" ? "text-scr-red" : "text-scr-green"}>{c.t}</span></p></li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <section className="scr-panel p-3">
        <h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><MapPin className="h-5 w-5 text-scr-cyan" />区县质控排名<span className="text-sm font-normal text-scr-dim">（点击地图高亮 · 当前 {area}{sel ? `：筛查 ${sel.screen}% / 干预 ${sel.guide}% / 就诊 ${sel.visit}%` : ""}）</span></h3>
        <table className="w-full text-sm">
          <thead className="text-xs text-scr-dim"><tr className="border-b border-scr-line/30">
            {["排名", "区县", "65岁+筛查覆盖率(≥90%)", "初筛阳性干预指导率(≥90%)", "疑似就诊率(≥85%)", "人员持证率", "质控结论"].map((h) => <th key={h} className="py-1.5 text-left font-normal">{h}</th>)}
          </tr></thead>
          <tbody>
            {[...QC].sort((a, b) => b.screen - a.screen).map((q, i) => {
              const ok = q.screen >= 90 && q.guide >= 90 && q.visit >= 85;
              return (
                <tr key={q.d} className={`border-b border-scr-line/15 ${q.d === area ? "bg-scr-gold/15" : ""}`}>
                  <td className="py-1">{i + 1}</td><td>{q.d}</td>
                  <td className={q.screen < 90 ? "text-scr-red" : ""}>{q.screen}%</td>
                  <td className={q.guide < 90 ? "text-scr-red" : ""}>{q.guide}%</td>
                  <td className={q.visit < 85 ? "text-scr-red" : ""}>{q.visit}%</td>
                  <td className={q.cert < 100 ? "text-scr-gold" : ""}>{q.cert}%</td>
                  <td><Badge ok={ok}>{ok ? "达标" : "预警 · 需督导"}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}

/* ===================== 县(区)级：区卫健委 / 县级龙头医院 ===================== */
const SCHEDULE = [
  { st: "小市", time: "09:00-09:30", g: "MCI 记忆组", n: 10, dom: "记忆 · 定向力" },
  { st: "宝塔桥", time: "09:30-10:00", g: "SCD 预防组", n: 12, dom: "注意力 · 计算" },
  { st: "江东", time: "10:00-10:30", g: "轻度痴呆组", n: 7, dom: "语言 · 视空间" },
  { st: "中央门", time: "14:00-14:30", g: "MCI 执行组", n: 9, dom: "执行功能 · 逻辑" },
  { st: "湖南路", time: "15:00-15:30", g: "照护者课堂", n: 11, dom: "居家安全 · 照护" },
];
const WORK = ["小市", "宝塔桥", "江东", "中央门", "热河南路", "幕府山"].map((s, i) => ({
  s, 筛查: [86, 64, 72, 58, 55, 52][i], 评估: [32, 24, 28, 21, 18, 20][i], 训练: [48, 36, 40, 30, 26, 28][i],
}));
const STAFF: Record<string, { head: string; assessor: string; manager: string }> = {
  小市: { head: "陈站长", assessor: "李评估师（执业医师）", manager: "孙治疗师（注册护士）" },
};
const dueDays = (s: string | null) => (s?.includes("3") ? 3 : s?.includes("6") ? 12 : 25);

export function CountyView({ map, area }: { map: ReactNode; area: string }) {
  const { data: patients = [] } = usePatients("all");
  const due = patients.filter((p) => p.cognitive_risk).sort((a, b) => (a.cognitive_risk === "高风险" ? -1 : 1) - (b.cognitive_risk === "高风险" ? -1 : 1)).slice(0, 6);
  const staff = STAFF[area] ?? { head: `${area}站长`, assessor: "评估师 1 名", manager: "治疗管理师 1 名" };
  return (
    <>
      <KpiStrip items={[
        { label: "今日服务人次", value: "214", sub: "筛查 86 · 评估 32 · 训练 96", icon: Users },
        { label: "本周小组训练", value: "46", unit: "场", sub: "每组 6-12 人 · 20-30 分钟", icon: Dumbbell },
        { label: "待推送上转", value: "5", unit: "人", sub: "需 3 个工作日内推送", icon: ArrowLeftRight, warn: true },
        { label: "待建档下转", value: "7", unit: "人", sub: "需 5 个工作日内建档", icon: ClipboardCheck, warn: true },
        { label: "本月随访到期", value: "128", unit: "人", sub: "已完成 96 · 剩余 32", icon: CalendarCheck },
        { label: "专业人员在岗", value: "26/26", sub: "评估师 13 · 治疗管理师 13", icon: UserCheck },
      ]} />
      <div className="grid grid-cols-[1fr_1.6fr_1fr] gap-3">
        <div className="flex flex-col gap-3">
          <Panel title="今日小组训练排班">
            <ul className="divide-y divide-scr-line/25 text-sm">
              {SCHEDULE.map((r) => (
                <li key={r.st + r.time} className="grid grid-cols-[3.5rem_6.5rem_1fr_3rem] items-center gap-2 py-1.5">
                  <span className="text-scr-cyan">{r.st}</span><span className="text-xs tabular-nums text-scr-dim">{r.time}</span>
                  <span><b className="text-[13px]">{r.g}</b><span className="block text-[11px] text-scr-dim">{r.dom}</span></span>
                  <span className={`text-right text-xs ${r.n >= 6 && r.n <= 12 ? "text-scr-green" : "text-scr-red"}`}>{r.n}/12</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="随访到期预警" sub="(按风险优先)" extra={<span className="text-xs text-scr-dim">共享档案实时</span>}>
            {due.length === 0 ? <p className="py-4 text-center text-xs text-scr-dim">登录后显示辖区老人随访名单</p> : (
              <ul className="divide-y divide-scr-line/25 text-sm">
                {due.map((p) => {
                  const d = dueDays(p.next_reassess);
                  return (
                    <li key={p.id} className="flex items-center gap-2 py-1.5">
                      <AlertTriangle className={`h-4 w-4 ${p.cognitive_risk === "高风险" ? "text-scr-red" : p.cognitive_risk === "中风险" ? "text-scr-gold" : "text-scr-cyan"}`} />
                      <span className="w-14">{p.name}</span><span className="flex-1 truncate text-xs text-scr-dim">{p.cognitive_diagnosis}</span>
                      <span className="text-xs">{p.cognitive_risk}</span><span className={`w-14 text-right text-xs ${d <= 3 ? "text-scr-red" : "text-scr-dim"}`}>{d} 天内</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        {map}

        <div className="flex flex-col gap-3">
          <Panel title="双向转诊时效">
            <div className="space-y-3">
              <Bar100 label="上转 3 个工作日内推送" v={94.6} target={95} />
              <Bar100 label="下转 5 个工作日内建档" v={97.2} target={95} />
              <Bar100 label="下转对象首次训练 2 周内" v={89.5} target={90} />
            </div>
          </Panel>
          <Panel title="站点工作量对比" sub="(本周人次)" className="h-56">
            <div className="flex h-full flex-col">
              <Legend items={[{ k: "筛查", c: C.cyan }, { k: "评估", c: C.gold }, { k: "训练", c: C.green }]} />
              <div className="min-h-0 flex-1"><ResponsiveContainer>
                <BarChart data={WORK} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                  <XAxis type="number" {...axis} /><YAxis type="category" dataKey="s" {...axis} width={56} interval={0} /><Tooltip {...tip} />
                  <Bar dataKey="筛查" stackId="a" fill={C.cyan} /><Bar dataKey="评估" stackId="a" fill={C.gold} />
                  <Bar dataKey="训练" stackId="a" fill={C.green}><LabelList position="right" fill="hsl(var(--scr-text))" fontSize={10} formatter={() => ""} /></Bar>
                </BarChart>
              </ResponsiveContainer></div>
            </div>
          </Panel>
          <Panel title="站点规范化建设" sub="(按建设标准)">
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              {[["评估室/训练室", 13, 13], ["八大领域训练教具", 12, 13], ["智能体站点端", 13, 13], ["宣教显示屏", 11, 13], ["急救包与血压计", 13, 13], ["专项健康档案", 12, 13]].map(([k, a, b]) => (
                <li key={k as string} className="flex items-center justify-between"><span className="text-scr-dim">{k}</span><Badge ok={a === b}>{a}/{b}</Badge></li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <section className="scr-panel grid grid-cols-[1fr_1.4fr_1.2fr] gap-4 p-3">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><Building2 className="h-5 w-5 text-scr-cyan" />{area}社区训练站 <span className="text-sm font-normal text-scr-dim">站点画像</span></h3>
          <ul className="space-y-1.5 text-sm">
            <li><span className="text-scr-dim">站长：</span>{staff.head}</li>
            <li><span className="text-scr-dim">评估师：</span>{staff.assessor}</li>
            <li><span className="text-scr-dim">治疗管理师：</span>{staff.manager}</li>
            <li><span className="text-scr-dim">开放时间：</span>周一至周五 8:30-17:00</li>
            <li><span className="text-scr-dim">签约上级：</span>南京市鼓楼医院记忆门诊</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-bold">本月核心指标 <span className="font-normal text-scr-dim">（对照建设标准）</span></h4>
          <div className="space-y-2.5">
            <Bar100 label="65岁+认知筛查覆盖率" v={95.1} target={90} />
            <Bar100 label="初筛阳性干预指导率" v={93.6} target={90} />
            <Bar100 label="疑似认知障碍就诊率" v={88.2} target={85} />
            <Bar100 label="月度随访完成率" v={75.0} target={90} />
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-bold">在管人群分层与复评周期</h4>
          <ul className="space-y-2 text-sm">
            {[["低风险 · SCD/正常", "每年复评 · 健康宣教", 132, C.blue], ["中风险 · MCI/轻中度", "每 6 月复评 · 训练+作业", 46, C.gold], ["高风险 · 重度痴呆", "每 3 月复评 · 上门评估", 8, C.red]].map(([k, d, n, c]) => (
              <li key={k as string} className="flex items-center gap-3 rounded border border-scr-line/30 p-2">
                <span className="h-8 w-1.5 rounded" style={{ background: c as string }} />
                <div className="flex-1"><b>{k}</b><p className="text-xs text-scr-dim">{d}</p></div>
                <span className="text-xl font-black text-scr-gold">{n}<span className="ml-0.5 text-xs text-scr-text">人</span></span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
