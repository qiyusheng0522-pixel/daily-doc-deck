import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProvinceDashboard from "./ProvinceDashboard";
import { ArrowLeftRight, AlertTriangle, Bot, Brain, Building2, CalendarCheck, ClipboardCheck, Dumbbell, FileText, Gauge, Home, MapPin, Search, Users } from "lucide-react";
import { JS_CITIES, JS_VIEWBOX } from "@/data/jiangsuMap";
import { CityView, CountyView } from "./LevelViews";
import { GL_AREAS, GL_STATIONS, GL_VIEWBOX, NJ_AREAS, NJ_VIEWBOX } from "@/data/nanjingMap";


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
const NJ: Record<string, CityStat> = {
  玄武区: { stations: 2, elders: 0.24, screen: 94.0, guide: 92.5, referral: 75.2, improve: 47.8 },
  秦淮区: { stations: 2, elders: 0.28, screen: 93.2, guide: 92.0, referral: 74.1, improve: 47.0 },
  建邺区: { stations: 1, elders: 0.16, screen: 94.5, guide: 93.0, referral: 76.0, improve: 48.2 },
  鼓楼区: { stations: 3, elders: 0.38, screen: 95.1, guide: 93.6, referral: 77.4, improve: 49.0 },
  浦口区: { stations: 2, elders: 0.29, screen: 92.6, guide: 91.4, referral: 73.0, improve: 46.4 },
  栖霞区: { stations: 2, elders: 0.27, screen: 93.0, guide: 91.8, referral: 73.8, improve: 46.9 },
  雨花台区: { stations: 1, elders: 0.17, screen: 93.8, guide: 92.2, referral: 74.6, improve: 47.3 },
  江宁区: { stations: 3, elders: 0.48, screen: 93.4, guide: 92.0, referral: 74.4, improve: 47.6 },
  六合区: { stations: 2, elders: 0.36, screen: 92.1, guide: 90.8, referral: 72.5, improve: 46.0 },
  溧水区: { stations: 2, elders: 0.30, screen: 92.4, guide: 91.2, referral: 73.2, improve: 46.5 },
  高淳区: { stations: 2, elders: 0.28, screen: 92.8, guide: 91.6, referral: 73.5, improve: 46.8 },
};
// 县(区)级：鼓楼区各训练站，elders 单位为"人"，stations 字段表示在管人数
const GL: Record<string, CityStat> = Object.fromEntries(GL_STATIONS.map((st, i) => [st.name, {
  stations: [186, 142, 128, 96, 154, 88, 110, 132, 74, 102, 120, 92, 98][i],
  elders: [312, 268, 240, 198, 286, 176, 220, 254, 160, 206, 232, 184, 196][i],
  screen: +(93 + (i * 7 % 5) * 0.6).toFixed(1), guide: +(91.5 + (i * 3 % 5) * 0.5).toFixed(1),
  referral: +(73 + (i * 5 % 6) * 0.8).toFixed(1), improve: +(46 + (i * 4 % 6) * 0.6).toFixed(1),
}]));

type Level = "province" | "city" | "county";
const LEVELS: Record<Level, {
  tab: string; org: string; title: string; scope: string; areaTab: string; suffix: string; hint: string;
  areas: Record<string, CityStat>; def: string; countLabel: string; countUnit: string; eldersUnit: string;
  base: { screen: number; guide: number; improve: number }; total: number; totalLabel: string;
  overall: { k: string; v: string; u: string }[]; flowScale: number;
}> = {
  province: {
    tab: "省级 · 监管决策", org: "江苏省卫生健康委员会", title: "江苏省老年认知训练站建设与服务监管大屏", scope: "江苏省",
    areaTab: "设区市", suffix: "市", hint: "点击城市查看详情 · 数字为训练站数量", areas: CITY, def: "南京",
    countLabel: "训练站数", countUnit: "个", eldersUnit: "万", base: { screen: 92.4, guide: 91.1, improve: 46.8 },
    total: 27.6, totalLabel: "27.6 万", flowScale: 1,
    overall: [{ k: "覆盖设区市", v: "13", u: "个" }, { k: "县域覆盖率", v: "100%", u: "" }, { k: "服务老年人", v: "27.6", u: "万" }],
  },
  city: {
    tab: "市级 · 指导中心", org: "南京市卫健委 · 市级指导中心", title: "南京市认知障碍防治指导中心驾驶舱", scope: "南京市",
    areaTab: "区县", suffix: "", hint: "点击区县查看详情 · 数字为训练站数量", areas: NJ, def: "鼓楼区",
    countLabel: "训练站数", countUnit: "个", eldersUnit: "万", base: { screen: 93.6, guide: 92.1, improve: 47.5 },
    total: 3.21, totalLabel: "3.21 万", flowScale: 0.1163,
    overall: [{ k: "覆盖区县", v: "11", u: "个" }, { k: "街镇覆盖率", v: "86%", u: "" }, { k: "服务老年人", v: "3.21", u: "万" }],
  },
  county: {
    tab: "县(区)级 · 站点运营", org: "鼓楼区卫健委 · 县级龙头医院", title: "鼓楼区认知训练站运营调度驾驶舱", scope: "鼓楼区",
    areaTab: "训练站", suffix: "社区训练站", hint: "点击训练站查看详情 · 数字为在管人数", areas: GL, def: "小市",
    countLabel: "在管人数", countUnit: "人", eldersUnit: "人", base: { screen: 95.1, guide: 93.6, improve: 49.0 },
    total: 0.38, totalLabel: "3,800 人", flowScale: 0.0138,
    overall: [{ k: "训练站", v: "13", u: "个" }, { k: "评估师/治疗管理师", v: "26", u: "人" }, { k: "服务老年人", v: "3,800", u: "人" }],
  },
};


const NAV = [
  { label: "总体概览", icon: Home }, { label: "站点建设", icon: Building2 }, { label: "筛查评估", icon: Search },
  { label: "干预训练", icon: Dumbbell }, { label: "随访管理", icon: CalendarCheck }, { label: "双向转诊", icon: ArrowLeftRight },
  { label: "智能体应用", icon: Bot }, { label: "效果评估", icon: Gauge },
];

const NAV_CITY = [
  { label: "总体概览", icon: Home }, { label: "巡回指导", icon: MapPin }, { label: "上转确诊", icon: ArrowLeftRight },
  { label: "区县质控", icon: Gauge }, { label: "培训考核", icon: ClipboardCheck }, { label: "疑难会诊", icon: Brain },
];
const NAV_COUNTY = [
  { label: "运营总览", icon: Home }, { label: "站点运营", icon: Building2 }, { label: "双向转诊", icon: ArrowLeftRight },
  { label: "小组训练", icon: Dumbbell }, { label: "随访预警", icon: AlertTriangle }, { label: "档案质量", icon: FileText },
];

function AreaMap({ level, city, onPick }: { level: Level; city: string; onPick: (c: string) => void }) {
  const cfg = LEVELS[level];
  if (level === "county") {
    return (
      <svg viewBox={GL_VIEWBOX} className="h-full w-full" style={{ filter: "drop-shadow(0 0 18px hsl(var(--scr-cyan) / 0.45))" }}>
        <defs><linearGradient id="glFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(205 95% 45%)" /><stop offset="100%" stopColor="hsl(220 90% 28%)" /></linearGradient></defs>
        {GL_AREAS.map((a) => <path key={a.name} d={a.d} fill="url(#glFill)" stroke="hsl(190 100% 75%)" strokeWidth={1.5} />)}
        {GL_STATIONS.map((st) => {
          const sel = st.name === city;
          return (
            <g key={st.name} className="cursor-pointer" onClick={() => onPick(st.name)} textAnchor="middle">
              <circle cx={st.x} cy={st.y} r={sel ? 14 : 9} fill={sel ? "hsl(var(--scr-gold))" : "hsl(var(--scr-cyan))"} stroke="hsl(var(--scr-text))" strokeWidth={2} />
              <text x={st.x} y={st.y - 20} fontSize={18} fontWeight={700} fill="hsl(var(--scr-text))">{st.name}</text>
              <text x={st.x} y={st.y + 34} fontSize={18} fontWeight={800} fill="hsl(var(--scr-gold))">{cfg.areas[st.name]?.stations}</text>
            </g>
          );
        })}
      </svg>
    );
  }
  const areas = level === "city" ? NJ_AREAS : JS_CITIES;
  const vb = level === "city" ? NJ_VIEWBOX : JS_VIEWBOX;
  const fs = level === "city" ? 24 : 15;
  return <PolyMap areas={areas} vb={vb} fs={fs} city={city} onPick={onPick} values={cfg.areas} />;
}

function PolyMap({ areas, vb, fs, city, onPick, values }: { areas: { name: string; d: string; cx: number; cy: number }[]; vb: string; fs: number; city: string; onPick: (c: string) => void; values: Record<string, CityStat> }) {
  const JS_CITIES = areas, JS_VIEWBOX = vb, CITY = values;
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
          <text x={c.cx} y={c.cy - 4} fontSize={fs} fontWeight={700} fill="hsl(var(--scr-text))">{c.name}</text>
          <text x={c.cx} y={c.cy + fs * 1.1} fontSize={fs * 1.2} fontWeight={800} fill="hsl(var(--scr-gold))">{CITY[c.name]?.stations ?? "-"}</text>
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
  const [params, setParams] = useSearchParams();
  const [nav, setNav] = useState("总体概览");
  const [level, setLevelRaw] = useState<Level>("province");
  const cfg = LEVELS[level];
  const [city, setCity] = useState(cfg.def);
  const setLevel = (l: Level) => { setLevelRaw(l); setCity(LEVELS[l].def); setNav(l === "county" ? "运营总览" : "总体概览"); };
  useEffect(() => {
    const requested = params.get("level");
    if (requested === "city" || requested === "county" || requested === "province") setLevel(requested);
  }, [params]);
  const clock = useClock();
  const cs = cfg.areas[city] ?? cfg.areas[cfg.def];
  const mapSection = (
          <section className="scr-panel relative flex flex-col p-3">
            <div className="flex gap-2">
              <span className="rounded border border-scr-cyan bg-scr-line/50 px-4 py-1 text-sm font-bold">{cfg.scope}</span>
              <span className="rounded border border-scr-line/50 px-4 py-1 text-sm text-scr-dim">{cfg.areaTab}</span>
              <span className="ml-3 self-center text-xs text-scr-dim">{cfg.hint}</span>
            </div>
            <div className="relative min-h-[520px] flex-1">
              <div className="absolute inset-x-[10%] bottom-2 h-16 rounded-[50%] border-2 border-scr-cyan/40" style={{ boxShadow: "0 0 40px hsl(var(--scr-cyan) / 0.4)" }} />
              <div className="absolute inset-0 right-[26%] p-2"><AreaMap level={level} city={city} onPick={setCity} /></div>
              <div className="scr-panel absolute right-2 top-4 w-48 space-y-4 p-3">
                <h4 className="text-lg font-bold">{cfg.scope}整体</h4>
                {cfg.overall.map((o, i) => ({ ...o, I: [Building2, MapPin, Users][i] })).map(({ k, v, u, I }) => (
                  <div key={k} className="flex items-center gap-3">
                    <I className="h-7 w-7 text-scr-cyan" />
                    <div><div className="text-xs text-scr-dim">{k}</div><div className="text-xl font-black text-scr-gold">{v}<span className="ml-1 text-xs text-scr-text">{u}</span></div></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

  );
  return (
    <div className="province-screen min-h-screen bg-scr-bg text-scr-text">
      {/* Header */}
      <header className="province-header grid items-center gap-2 px-4 py-3 xl:grid-cols-[1fr_2.6fr_1fr]">
        <Link to="/" className="flex items-center gap-2 text-sm font-bold"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-scr-red text-scr-gold">★</span>{cfg.org}</Link>
        <h1 className="scr-glow pb-2 text-center text-xl font-black xl:text-[25px]">{cfg.title}</h1>
        <div className="flex items-center justify-end gap-2 text-xs text-scr-dim"><CalendarCheck className="h-4 w-4" /><span className="tabular-nums">{clock}</span></div>
      </header>

      {/* Nav */}
      <nav className="flex flex-wrap justify-center gap-2 px-4 py-2">
        {(level === "province" ? NAV : level === "city" ? NAV_CITY : NAV_COUNTY).map(({ label, icon: I }) => (
          <Button variant="screen" key={label} onClick={() => setNav(label)}
            className={`flex h-8 items-center gap-2 border px-3 py-1.5 text-xs transition ${nav === label ? "border-scr-cyan bg-scr-line/60 font-bold text-scr-text" : "border-scr-line/50 bg-scr-panel/60 text-scr-dim hover:text-scr-text"}`}>
            <I className="h-4 w-4" />{label}
          </Button>
        ))}
      </nav>

      <div className="flex flex-wrap justify-center gap-2 px-3 pb-3">
        <span className="self-center text-xs text-scr-dim">驾驶舱视角：</span>
        {(Object.keys(LEVELS) as Level[]).map((l) => (
          <Button variant="screen" key={l} onClick={() => { setLevel(l); setParams({ level: l }); }}
            className={`h-7 rounded-full border px-3 py-1 text-xs transition ${level === l ? "border-scr-gold bg-scr-gold/20 font-bold text-scr-gold" : "border-scr-line/50 text-scr-dim hover:text-scr-text"}`}>
            {LEVELS[l].tab}
          </Button>
        ))}
      </div>

      <main className="space-y-3 px-4 pb-4">
        {level === "province" ? <ProvinceDashboard nav={nav} onOverview={() => setNav("总体概览")} /> : level === "city" ? <CityView map={mapSection} area={city} /> : <CountyView map={mapSection} area={city} />}
      </main>
    </div>
  );
}
