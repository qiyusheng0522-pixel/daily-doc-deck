import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowLeftRight, ArrowUp, Bot, Brain, Building2, CalendarCheck, ClipboardCheck,
  Dumbbell, FileText, Gauge, Home, Info, Layers, MapPin, Search, Sun, Target, TrendingUp, Users, Wrench,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { JS_CITIES, JS_VIEWBOX } from "@/data/jiangsuMap";

const C = {
  cyan: "hsl(var(--scr-cyan))", green: "hsl(var(--scr-green))", gold: "hsl(var(--scr-gold))",
  red: "hsl(var(--scr-red))", blue: "hsl(210 90% 58%)", purple: "hsl(265 80% 70%)",
  dim: "hsl(var(--scr-dim))", grid: "hsl(var(--scr-line) / 0.2)",
};

type CityStat = { stations: number; elders: number; screen: number; guide: number; referral: number; improve: number };
const CITY: Record<string, CityStat> = {
  南京: { stations: 22, elders: 3.21, screen: 93.6, guide: 92.1, referral: 74.8, improve: 47.5 },
  徐州: { stations: 18, elders: 2.86, screen: 91.2, guide: 90.4, referral: 70.1, improve: 45.2 },
  连云港: { stations: 12, elders: 1.62, screen: 90.8, guide: 89.7, referral: 69.5, improve: 44.0 },
  宿迁: { stations: 9, elders: 1.18, screen: 89.4, guide: 88.6, referral: 68.2, improve: 43.1 },
  淮安: { stations: 11, elders: 1.74, screen: 91.0, guide: 90.2, referral: 71.0, improve: 45.8 },
  盐城: { stations: 14, elders: 2.35, screen: 92.3, guide: 91.0, referral: 72.4, improve: 46.3 },
  扬州: { stations: 13, elders: 1.96, screen: 93.1, guide: 91.8, referral: 73.6, improve: 47.0 },
  泰州: { stations: 10, elders: 1.88, screen: 92.0, guide: 90.9, referral: 72.0, improve: 46.1 },
  南通: { stations: 12, elders: 2.62, screen: 93.4, guide: 92.0, referral: 74.0, improve: 47.9 },
  镇江: { stations: 8, elders: 1.12, screen: 92.8, guide: 91.5, referral: 73.1, improve: 46.7 },
  常州: { stations: 11, elders: 1.95, screen: 93.0, guide: 91.7, referral: 73.4, improve: 47.2 },
  无锡: { stations: 12, elders: 2.31, screen: 93.8, guide: 92.4, referral: 75.0, improve: 48.1 },
  苏州: { stations: 4, elders: 2.80, screen: 94.1, guide: 92.6, referral: 75.6, improve: 48.4 },
};
const PROV = { screen: 92.4, guide: 91.1, improve: 46.8 };

const NAV = [
  { label: "总体概览", icon: Home }, { label: "站点建设", icon: Building2 }, { label: "筛查评估", icon: Search },
  { label: "干预训练", icon: Dumbbell }, { label: "随访管理", icon: CalendarCheck }, { label: "双向转诊", icon: ArrowLeftRight },
  { label: "智能体应用", icon: Bot }, { label: "效果评估", icon: Gauge },
];

const KPIS = [
  { label: "训练站总数", value: "156", unit: "个", sub: "目标 200 | 进度 78%", icon: Building2 },
  { label: "服务老年人", value: "27.6", unit: "万人", delta: "+18.7%", icon: Users },
  { label: "筛查覆盖率", value: "92.4%", delta: "+3.8pct", icon: ClipboardCheck },
  { label: "干预指导率", value: "91.1%", delta: "+5.2pct", icon: Target },
  { label: "转诊完成率", value: "72.6%", delta: "+6.9pct", icon: ArrowLeftRight },
  { label: "认知改善率", value: "46.8%", delta: "+12.1pct", icon: Brain },
];

const FLOW = [
  { k: "建档", v: "27.6万", icon: FileText }, { k: "筛查", v: "25.5万", icon: Search },
  { k: "评估", v: "7.9万", icon: ClipboardCheck }, { k: "分层", v: "7.2万", icon: Layers },
  { k: "干预训练", v: "6.6万", icon: Dumbbell }, { k: "随访", v: "6.3万", icon: CalendarCheck },
  { k: "转诊", v: "5,842", icon: ArrowLeftRight },
];

const riskData = (total: number, pct = [70.5, 18.9, 7.1, 3.5]) =>
  ["低风险", "中风险", "高风险", "极高风险"].map((name, i) => ({
    name, pct: pct[i], value: +(total * pct[i] / 100).toFixed(2),
  }));
const RISK_COLORS = [C.blue, C.green, C.gold, C.red];

const months = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月"];
const trend = (scale: number) => months.map((m, i) => ({
  m, a: +((8 + i * 2.3) * scale).toFixed(2), b: +((5 + i * 1.4) * scale).toFixed(2), c: +((3 + i * 1.2) * scale).toFixed(2),
}));

const QTREND = [
  { q: "2026Q1", a: 81, b: 76, c: 66 }, { q: "2026Q2", a: 85, b: 82, c: 68 },
  { q: "2026Q3", a: 89, b: 87, c: 70 }, { q: "2026Q4", a: 92.4, b: 91.1, c: 72.6 },
];
const EFFECT = [
  { k: "认知功能改善率", pre: 34.7, post: 46.8 }, { k: "日常生活能力提升率", pre: 30.7, post: 41.3 },
  { k: "高风险人群稳定率", pre: 81.2, post: 88.7 },
];
const AGENT = [
  { k: "量表评估完成率", v: "72%", icon: ClipboardCheck }, { k: "训练任务完成率", v: "88.7%", icon: Dumbbell },
  { k: "随访完成率", v: "95.7%", icon: CalendarCheck }, { k: "宣教触达率", v: "98.1%", icon: Users },
];
const ALERTS = [
  { k: "高风险人群超期未随访", n: 23, t: "10-28 14:12", icon: AlertTriangle, c: "text-scr-red" },
  { k: "待接收上转申请", n: 18, t: "10-28 13:40", icon: AlertTriangle, c: "text-scr-gold" },
  { k: "下转对象待建档", n: 7, t: "10-28 11:26", icon: Info, c: "text-scr-cyan" },
];

const tip = { contentStyle: { background: "hsl(var(--scr-panel))", border: "1px solid hsl(var(--scr-line))", color: "hsl(var(--scr-text))", fontSize: 12 } };
const axis = { stroke: C.dim, fontSize: 11, tickLine: false, axisLine: { stroke: C.grid } } as const;

function Panel({ title, sub, extra, children, className = "" }: { title: string; sub?: string; extra?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`scr-panel flex flex-col overflow-hidden ${className}`}>
      <header className="scr-title flex items-center justify-between px-3 py-1.5">
        <h3 className="text-[15px] font-bold text-scr-text">{title}{sub && <span className="ml-2 text-xs font-normal text-scr-dim">{sub}</span>}</h3>
        {extra}
      </header>
      <div className="min-h-0 flex-1 p-2">{children}</div>
    </section>
  );
}

function Legend({ items }: { items: { c: string; k: string }[] }) {
  return (
    <div className="flex justify-center gap-4 text-[11px] text-scr-dim">
      {items.map((i) => <span key={i.k} className="flex items-center gap-1"><span className="h-1 w-4 rounded" style={{ background: i.c }} />{i.k}</span>)}
    </div>
  );
}

function TrendChart({ data, labels, xKey = "m" }: { data: object[]; labels: string[]; xKey?: string }) {
  const cols = [C.cyan, C.green, C.purple];
  return (
    <div className="flex h-full flex-col">
      <Legend items={labels.map((k, i) => ({ k, c: cols[i] }))} />
      <div className="min-h-0 flex-1">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 6, right: 10, left: -18, bottom: 0 }}>
            <defs>
              {cols.map((c, i) => (
                <linearGradient key={i} id={`g${i}${xKey}${labels[0]}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={0.35} /><stop offset="100%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis dataKey={xKey} {...axis} />
            <YAxis {...axis} />
            <Tooltip {...tip} />
            {(["a", "b", "c"] as const).map((k, i) => (
              <Area key={k} dataKey={k} name={labels[i]} stroke={cols[i]} strokeWidth={2} fill={`url(#g${i}${xKey}${labels[0]})`} dot={{ r: 2 }} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RiskDonut({ total, label, pct }: { total: number; label: string; pct?: number[] }) {
  const data = riskData(total, pct);
  return (
    <div className="flex h-full items-center gap-3">
      <div className="relative h-full min-h-[110px] w-[44%]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius="68%" outerRadius="92%" stroke="none" startAngle={90} endAngle={-270}>
              {data.map((_, i) => <Cell key={i} fill={RISK_COLORS[i]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-scr-text">
          <span className="text-lg font-bold">{label}</span><span className="text-[11px] text-scr-dim">服务人群</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2 text-[13px] text-scr-text">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ background: RISK_COLORS[i] }} />
            <span className="w-16">{d.name}</span>
            <span className="ml-auto tabular-nums">{d.pct}%（{d.value}万）</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function JiangsuMap({ city, onPick }: { city: string; onPick: (c: string) => void }) {
  return (
    <svg viewBox={JS_VIEWBOX} className="h-full w-full" style={{ filter: "drop-shadow(0 0 18px hsl(var(--scr-cyan) / 0.45))" }}>
      <defs>
        <linearGradient id="cityFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(205 95% 45%)" /><stop offset="100%" stopColor="hsl(220 90% 28%)" />
        </linearGradient>
        <linearGradient id="citySel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(48 100% 65%)" /><stop offset="100%" stopColor="hsl(38 90% 45%)" />
        </linearGradient>
      </defs>
      {JS_CITIES.map((c) => (
        <path key={c.name} d={c.d} fill={c.name === city ? "url(#citySel)" : "url(#cityFill)"}
          stroke="hsl(190 100% 75%)" strokeWidth={c.name === city ? 2 : 0.8}
          className="cursor-pointer transition-opacity hover:opacity-80" onClick={() => onPick(c.name)} />
      ))}
      {JS_CITIES.map((c) => (
        <g key={c.name + "l"} className="pointer-events-none" textAnchor="middle">
          <text x={c.cx} y={c.cy - 4} fontSize={15} fontWeight={700} fill="hsl(var(--scr-text))">{c.name}</text>
          <text x={c.cx} y={c.cy + 16} fontSize={18} fontWeight={800} fill="hsl(var(--scr-gold))">{CITY[c.name]?.stations ?? "-"}</text>
        </g>
      ))}
    </svg>
  );
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}  ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
}

export default function ProvinceScreen() {
  const [nav, setNav] = useState("总体概览");
  const [city, setCity] = useState("南京");
  const clock = useClock();
  const cs = CITY[city];
  const diff = (a: number, b: number) => `${a >= b ? "▲" : "▼"} ${Math.abs(a - b).toFixed(1)}pct`;

  return (
    <div className="min-h-screen bg-scr-bg text-scr-text" style={{ backgroundImage: "radial-gradient(ellipse at 50% 40%, hsl(215 90% 18%) 0%, transparent 65%)" }}>
      {/* Header */}
      <header className="relative flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-scr-red text-scr-gold">★</span>江苏省卫生健康委员会
        </Link>
        <h1 className="scr-glow absolute left-1/2 -translate-x-1/2 text-[28px] font-black tracking-[0.12em]">江苏省老年认知训练站建设与服务监管大屏</h1>
        <div className="flex items-center gap-6 text-sm text-scr-dim">
          <span className="tabular-nums">{clock}</span>
          <span className="flex items-center gap-1"><Sun className="h-4 w-4" />南京 18-24℃</span>
        </div>
      </header>

      {/* Nav */}
      <nav className="flex justify-center gap-3 px-6 pb-3">
        {NAV.map(({ label, icon: I }) => (
          <button key={label} onClick={() => setNav(label)}
            className={`flex items-center gap-2 border px-6 py-1.5 text-sm transition [clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)] ${nav === label ? "border-scr-cyan bg-scr-line/60 font-bold text-scr-text" : "border-scr-line/50 bg-scr-panel/60 text-scr-dim hover:text-scr-text"}`}>
            <I className="h-4 w-4" />{label}
          </button>
        ))}
      </nav>

      <main className="space-y-3 px-4 pb-4">
        {/* KPI strip */}
        <section className="scr-panel grid grid-cols-6 divide-x divide-scr-line/30 py-3">
          {KPIS.map(({ label, value, unit, sub, delta, icon: I }) => (
            <div key={label} className="flex items-center justify-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-scr-cyan/60 bg-scr-line/30"><I className="h-7 w-7 text-scr-cyan" /></span>
              <div>
                <div className="text-sm text-scr-dim">{label}</div>
                <div className="text-2xl font-black text-scr-gold">{value}{unit && <span className="ml-1 text-sm font-normal text-scr-text">{unit}</span>}</div>
                {sub ? <div className="text-xs text-scr-dim">{sub}</div> : <div className="flex items-center text-xs text-scr-green"><ArrowUp className="h-3 w-3" />{delta}</div>}
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-[1fr_1.6fr_1fr] gap-3">
          {/* Left */}
          <div className="flex flex-col gap-3">
            <Panel title="服务全流程概览" sub="(年度服务量)">
              <div className="flex items-start justify-between">
                {FLOW.map(({ k, v, icon: I }, i) => (
                  <div key={k} className="flex items-start">
                    <div className="flex flex-col items-center gap-1">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-scr-cyan/50 bg-scr-line/25"><I className="h-5 w-5 text-scr-cyan" /></span>
                      <span className="text-xs text-scr-dim">{k}</span>
                      <span className="text-sm font-bold">{v}</span>
                    </div>
                    {i < FLOW.length - 1 && <span className="mt-2.5 px-0.5 text-scr-cyan">→</span>}
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="人群风险分布" sub="(N=27.6 万)" className="h-44"><RiskDonut total={27.6} label="27.6 万" /></Panel>
            <Panel title="认知健康管理人群趋势" sub="(万人)" className="h-52"><TrendChart data={trend(1)} labels={["建档人数", "干预人数", "随访人数"]} /></Panel>
            <Panel title="近期重点预警" extra={<span className="text-xs text-scr-dim">更多 ›</span>}>
              <ul className="divide-y divide-scr-line/25 text-sm">
                {ALERTS.map(({ k, n, t, icon: I, c }) => (
                  <li key={k} className="flex items-center gap-2 py-2">
                    <I className={`h-4 w-4 ${c}`} /><span className="flex-1">{k}</span>
                    <span className="w-14 font-bold">{n} 人</span><span className="text-xs text-scr-dim tabular-nums">{t}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Center map */}
          <section className="scr-panel relative flex flex-col p-3">
            <div className="flex gap-2">
              <span className="rounded border border-scr-cyan bg-scr-line/50 px-4 py-1 text-sm font-bold">江苏省</span>
              <span className="rounded border border-scr-line/50 px-4 py-1 text-sm text-scr-dim">设区市</span>
              <span className="ml-3 self-center text-xs text-scr-dim">点击城市查看详情 · 数字为训练站数量</span>
            </div>
            <div className="relative min-h-[520px] flex-1">
              <div className="absolute inset-x-[10%] bottom-2 h-16 rounded-[50%] border-2 border-scr-cyan/40" style={{ boxShadow: "0 0 40px hsl(var(--scr-cyan) / 0.4)" }} />
              <div className="absolute inset-0 right-[26%] p-2"><JiangsuMap city={city} onPick={setCity} /></div>
              <div className="scr-panel absolute right-2 top-4 w-48 space-y-4 p-3">
                <h4 className="text-lg font-bold">江苏省整体</h4>
                {[{ k: "覆盖设区市", v: "13", u: "个", I: Building2 }, { k: "县域覆盖率", v: "100%", u: "", I: MapPin }, { k: "服务老年人", v: "27.6", u: "万", I: Users }].map(({ k, v, u, I }) => (
                  <div key={k} className="flex items-center gap-3">
                    <I className="h-7 w-7 text-scr-cyan" />
                    <div><div className="text-xs text-scr-dim">{k}</div><div className="text-xl font-black text-scr-gold">{v}<span className="ml-1 text-xs text-scr-text">{u}</span></div></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right */}
          <div className="flex flex-col gap-3">
            <Panel title="关键服务指标趋势" extra={<span className="rounded border border-scr-line/60 px-2 text-xs text-scr-dim">年度</span>} className="h-56">
              <div className="flex h-full flex-col">
                <Legend items={[{ k: "筛查覆盖率", c: C.cyan }, { k: "干预指导率", c: C.green }, { k: "转诊完成率", c: C.gold }]} />
                <div className="min-h-0 flex-1">
                  <ResponsiveContainer>
                    <LineChart data={QTREND} margin={{ top: 8, right: 40, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke={C.grid} vertical={false} />
                      <XAxis dataKey="q" {...axis} /><YAxis domain={[60, 100]} unit="%" {...axis} />
                      <Tooltip {...tip} />
                      <Line dataKey="a" name="筛查覆盖率" stroke={C.cyan} strokeWidth={2.5}><LabelList dataKey="a" position="right" fill={C.cyan} fontSize={11} formatter={(v: number) => v === 92.4 ? "92.4%" : ""} /></Line>
                      <Line dataKey="b" name="干预指导率" stroke={C.green} strokeWidth={2.5}><LabelList dataKey="b" position="right" fill={C.green} fontSize={11} formatter={(v: number) => v === 91.1 ? "91.1%" : ""} /></Line>
                      <Line dataKey="c" name="转诊完成率" stroke={C.gold} strokeWidth={2.5}><LabelList dataKey="c" position="right" fill={C.gold} fontSize={11} formatter={(v: number) => v === 72.6 ? "72.6%" : ""} /></Line>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Panel>
            <Panel title="干预效果评估" sub="(干预前后对比)" className="h-52">
              <div className="flex h-full flex-col">
                <Legend items={[{ k: "干预前", c: C.blue }, { k: "干预后", c: C.green }]} />
                <div className="min-h-0 flex-1">
                  <ResponsiveContainer>
                    <BarChart data={EFFECT} margin={{ top: 18, right: 4, left: 4, bottom: 0 }} barGap={4}>
                      <XAxis dataKey="k" {...axis} interval={0} />
                      <Tooltip {...tip} cursor={{ fill: "hsl(var(--scr-line) / 0.1)" }} />
                      <Bar dataKey="pre" name="干预前" fill={C.blue} barSize={26}><LabelList dataKey="pre" position="top" fill="hsl(var(--scr-text))" fontSize={11} formatter={(v: number) => `${v}%`} /></Bar>
                      <Bar dataKey="post" name="干预后" fill={C.green} barSize={26}><LabelList dataKey="post" position="top" fill={C.gold} fontSize={11} formatter={(v: number) => `${v}%`} /></Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Panel>
            <Panel title="智能体应用成效" sub="(人机协同)">
              <div className="grid grid-cols-4 gap-2">
                {AGENT.map(({ k, v, icon: I }) => (
                  <div key={k} className="flex flex-col items-center gap-1 rounded border border-scr-line/40 bg-scr-line/10 py-2 text-center">
                    <I className="h-6 w-6 text-scr-cyan" /><span className="px-1 text-[11px] text-scr-dim">{k}</span>
                    <span className="text-lg font-black text-scr-gold">{v}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        {/* City detail */}
        <section className="scr-panel p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold"><MapPin className="h-5 w-5 text-scr-cyan" />{city}市<span className="text-sm font-normal text-scr-dim">服务管理详情</span></h3>
            <div className="flex gap-6 text-sm text-scr-dim">
              <span>较全省均值：</span>
              <span>筛查覆盖率 <b className="text-scr-green">{diff(cs.screen, PROV.screen)}</b></span>
              <span>干预指导率 <b className="text-scr-green">{diff(cs.guide, PROV.guide)}</b></span>
              <span>认知改善率 <b className="text-scr-green">{diff(cs.improve, PROV.improve)}</b></span>
            </div>
          </div>
          <div className="grid h-52 grid-cols-[1fr_1.6fr_1.2fr] gap-4">
            <ul className="space-y-1.5 text-sm">
              {[
                { k: "训练站数", v: `${cs.stations} 个`, I: Building2 }, { k: "服务老年人", v: `${cs.elders} 万`, I: Users },
                { k: "筛查覆盖率", v: `${cs.screen}%`, I: ClipboardCheck }, { k: "干预指导率", v: `${cs.guide}%`, I: Activity },
                { k: "转诊完成率", v: `${cs.referral}%`, I: ArrowLeftRight }, { k: "认知改善率", v: `${cs.improve}%`, I: TrendingUp },
              ].map(({ k, v, I }) => (
                <li key={k} className="flex items-center gap-3 border-b border-scr-line/20 pb-1">
                  <I className="h-4 w-4 text-scr-cyan" /><span className="w-24 text-scr-dim">{k}</span><span className="text-lg font-black text-scr-gold">{v}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col"><h4 className="text-sm font-bold">{city}市服务趋势 <span className="font-normal text-scr-dim">(万人)</span></h4>
              <div className="min-h-0 flex-1"><TrendChart data={trend(cs.elders / 27.6)} labels={["筛查人数", "干预人数", "随访人数"]} /></div>
            </div>
            <div className="flex flex-col"><h4 className="text-sm font-bold">{city}市人群风险分布 <span className="font-normal text-scr-dim">(N={cs.elders} 万)</span></h4>
              <div className="min-h-0 flex-1"><RiskDonut total={cs.elders} label={`${cs.elders} 万`} pct={[71.3, 18.6, 6.8, 3.3]} /></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
