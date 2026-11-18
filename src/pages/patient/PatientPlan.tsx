import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, Utensils, HeartPulse, Play, CheckCircle2,
  Footprints, AlertTriangle, ChevronDown, Lock, ClipboardList, FileText, ArrowRight,
} from "lucide-react";
import medicalAvatar from "@/assets/medical-avatar.png";
import mallBanner from "@/assets/mall-banner.jpg";
import PatientActionSheet from "@/components/patient/PatientActionSheet";
import {
  isProfileComplete, subscribeProfile, setProfileComplete,
  diseaseTags, lifestyleTags, riskOverview,
} from "@/data/patientProfile";

const toneClass: Record<string, string> = {
  rose: "text-rose-600",
  orange: "text-orange-500",
  amber: "text-amber-600",
  cyan: "text-cyan-700",
};


const days = ["07/15", "07/16", "07/17", "07/18", "07/19"];

const PatientPlan = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"nutrition" | "tcm">("nutrition");
  const [activeDay, setActiveDay] = useState("07/15");
  const [expandBreakfast, setExpandBreakfast] = useState(true);
  const [mallOpen, setMallOpen] = useState(false);
  const [ready, setReady] = useState(isProfileComplete());

  useEffect(() => subscribeProfile(() => setReady(isProfileComplete())), []);


  const mallProducts = [
    { emoji: "🩺", name: "上臂式电子血压计", price: "¥ 269", tag: "监测设备", desc: "医用级 · 房颤检测" },
    { emoji: "🥗", name: "低钠营养轻食(7 日装)", price: "¥ 39/餐", tag: "健康餐", desc: "营养师配比,冷链配送" },
    { emoji: "🏃", name: "康复弹力带 3 件套", price: "¥ 59", tag: "康复器械", desc: "轻/中/强三档阻力" },
    { emoji: "💊", name: "深海鱼油 EPA+DHA", price: "¥ 128", tag: "营养补充", desc: "有助血脂管理" },
    { emoji: "⌚", name: "房颤智能监测手环", price: "¥ 699", tag: "监测设备", desc: "24h 心律 · 血氧监测" },
    { emoji: "🍚", name: "五谷杂粮主食礼盒", price: "¥ 89", tag: "健康餐", desc: "低 GI · 6 种粗粮" },
    { emoji: "🧂", name: "低钠调味料套装", price: "¥ 45", tag: "健康餐", desc: "钠含量降低 60%" },
    { emoji: "🧘", name: "居家康复瑜伽垫", price: "¥ 99", tag: "康复器械", desc: "TPE 环保 · 加厚防滑" },
  ];

  return (
    <div className="space-y-3 pb-6">
      {/* 顶部:人物 hero + 疾病 / 生活标签 */}
      <div className="relative overflow-hidden bg-gradient-to-b from-sky-400 to-sky-300 pb-6">

        <div className="relative flex h-64 items-end justify-center">
          {ready && (
            <div className="absolute left-2 top-6 z-10 flex flex-col items-start gap-1.5">
              {diseaseTags.map((t) => (
                <span key={t.label} className={`rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium shadow-sm ${toneClass[t.tone]}`}>
                  {t.label}
                </span>
              ))}
            </div>
          )}

          {ready && (
            <div className="absolute right-2 top-6 z-10 flex flex-col items-end gap-1.5">
              {lifestyleTags.map((t) => (
                <span key={t.label} className={`rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium shadow-sm ${toneClass[t.tone]}`}>
                  {t.label}
                </span>
              ))}
            </div>
          )}

          {/* 医学虚拟人像 */}
          <div className="relative flex h-64 items-end justify-center">
            <div className="absolute inset-x-0 bottom-0 mx-auto h-40 w-40 rounded-full bg-white/25 blur-2xl" />
            <img
              src={medicalAvatar}
              alt="医学虚拟人像"
              width={768}
              height={1024}
              loading="lazy"
              className="relative h-64 w-auto object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* 风险评估总结 */}
        <div className="mx-3 mt-2 rounded-2xl bg-white/95 p-3 shadow-sm ring-1 ring-white/60 backdrop-blur">
          {ready ? (
            <>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="flex items-center gap-1 text-xs font-semibold text-rose-600">
                  <AlertTriangle className="h-3.5 w-3.5" /> 综合风险评估 · {riskOverview.level}
                </p>
                <button onClick={() => navigate("/patient/risk")} className="inline-flex items-center text-[11px] text-primary">
                  详情 <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <p className="text-[12px] leading-relaxed text-foreground/85">
                综合 <b>{diseaseTags.length} 项病症</b> 与 <b>{lifestyleTags.length} 项生活问题</b>,MMSE <b className="text-rose-600">24 分</b>,
                提示 1 年内认知衰退风险约 <b className="text-rose-600">{riskOverview.recurrenceRisk}</b>。建议优先干预
                {riskOverview.priority.map((p, i) => (
                  <span key={p}>{i === 0 ? "" : "、"}<b className="text-primary">{p}</b></span>
                ))}。
              </p>
            </>
          ) : (
            <>
              <p className="flex items-center gap-1 text-xs font-semibold text-primary">
                <AlertTriangle className="h-3.5 w-3.5" /> 请先补充档案与评估问卷
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-foreground/85">
                完成后我们将根据您的病史、体检与生活方式，生成专属的风险评估和 3 个月干预方案。
              </p>
            </>
          )}
        </div>
      </div>



      {ready ? (<>
      {/* 我的健康解读与目标 */}
      <section className="mx-3 -mt-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">

        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <HeartPulse className="h-4 w-4 text-primary" />
          </span>
          <h3 className="text-base font-semibold">我的健康解读与目标</h3>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          您目前处于 <b className="text-primary">轻度认知障碍</b> 二级预防阶段。近 7 天您的
          <b className="text-primary">血压偏高</b>、<b className="text-primary">LDL 尚未达标</b>,
          日常久坐较多,饮水仅 <b className="text-primary">1000-1500ml</b>,口味偏咸,入睡偏晚,
          提示您 <b className="text-rose-600">认知衰退风险偏高</b>。
        </p>
        <div className="mt-3 rounded-xl bg-primary/5 p-3 text-sm leading-relaxed text-foreground/90 ring-1 ring-primary/10">
          <p className="mb-1 text-xs font-semibold text-primary">我的 3 个月目标</p>
          <ul className="space-y-1 text-[13px]">
            <li>· 血压稳定控制在 <b>&lt;130/80 mmHg</b></li>
            <li>· LDL-C 降至 <b>&lt;1.8 mmol/L</b></li>
            <li>· 每日饮水 <b>≥1500ml</b>、每周中等强度运动 <b>≥150 分钟</b></li>
            <li>· 每日盐摄入 <b>&lt;5g</b>,规律作息 23:00 前入睡</li>
          </ul>
          <p className="mt-2 text-[12px] text-muted-foreground">
            接下来您将从 <b className="text-primary">饮食、运动、睡眠、监测</b> 四个方面开始为期 3 个月的干预。
          </p>
        </div>
      </section>

      {/* 通用饮食方案 */}
      <section className="mx-3 rounded-2xl bg-gradient-to-b from-cyan-50 to-white p-4 shadow-sm ring-1 ring-cyan-100 dark:from-cyan-950/40 dark:to-transparent dark:ring-cyan-900/40">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">通用饮食方案</h3>
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
                通用方案 · 免费
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">基于MIND护脑饮食通用建议</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/40">
            <Utensils className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
          </div>
        </div>

        <div className="flex gap-4 border-b">
          {(["nutrition", "tcm"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`relative pb-2 text-sm font-medium ${
                tab === k ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {k === "nutrition" ? "营养方案" : "药食同源"}
              {tab === k && <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">当前您执行的是 <span className="font-semibold text-orange-500">{tab === "nutrition" ? "营养方案" : "药食同源"}</span></span>
          <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">已选择该方案</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span>用餐时间:</span>
          <span className="font-semibold">07:30 - 19:00</span>
        </div>

        {/* Kcal ring */}
        <div className="mt-4 flex items-center gap-4">
          <div className="relative h-28 w-28">
            <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
              <circle cx="21" cy="21" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
              <circle cx="21" cy="21" r="16" fill="none" stroke="#f59e0b" strokeWidth="5" strokeDasharray="45 100" strokeLinecap="round" />
              <circle cx="21" cy="21" r="16" fill="none" stroke="#3b82f6" strokeWidth="5" strokeDasharray="30 100" strokeDashoffset="-45" strokeLinecap="round" />
              <circle cx="21" cy="21" r="16" fill="none" stroke="#06b6d4" strokeWidth="5" strokeDasharray="25 100" strokeDashoffset="-75" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-bold">1486</p>
              <p className="text-[10px] text-muted-foreground">Kcal</p>
            </div>
          </div>
          <div className="flex-1 space-y-1.5 text-sm">
            <Row color="bg-amber-500" label="碳水化合物" val="156.8 g" />
            <Row color="bg-blue-500" label="脂肪" val="56.4 g" />
            <Row color="bg-cyan-500" label="蛋白质" val="89.5 g" />
          </div>
        </div>

        {/* Day tabs */}
        <div className="mt-4 flex justify-between border-t pt-3 text-sm">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`flex flex-col items-center gap-1 ${activeDay === d ? "font-semibold text-primary" : "text-muted-foreground"}`}
            >
              <span className="text-xs">{d}</span>
              {activeDay === d && <span className="h-0.5 w-6 rounded-full bg-primary" />}
            </button>
          ))}
        </div>

        {/* actions */}
        <div className="mt-3 flex gap-2">
          <button className="w-full rounded-full border border-cyan-300 py-2 text-sm text-cyan-700 dark:border-cyan-800 dark:text-cyan-300">
            ↻ 不想吃全部换
          </button>
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          带 <span className="text-rose-500">●</span> 食谱包含卫健委公布的药食同源药材,点击查看功效
        </p>

        {/* Meals */}
        <div className="mt-3 space-y-2">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border/60 dark:bg-card">
            <button
              onClick={() => setExpandBreakfast((v) => !v)}
              className="flex w-full items-center gap-2 p-3 text-sm"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${expandBreakfast ? "" : "-rotate-90"}`} />
              <span className="font-semibold">早餐</span>
              <span className="text-muted-foreground">约 380 千卡</span>
              <span className="ml-auto text-xs text-muted-foreground">· 推荐结构</span>
            </button>
            {expandBreakfast && (
              <div className="space-y-2 border-t px-3 py-3">
                <p className="text-xs text-muted-foreground">推荐结构:粗细搭配主食 + 优质蛋白 + 蔬菜/水果</p>
                <MealItem title="粗细搭配主食" weight="50-75 克(生重)" items={["燕麦南瓜粥", "杂粮馒头", "全麦面包"]} tip="粗粮占 1/3 以上" />
                <MealItem title="优质蛋白" weight="1 份" items={["水煮蛋 1 个", "脱脂牛奶 250ml", "无糖豆浆 300ml"]} />
                <div className="rounded-lg border border-dashed border-cyan-300 bg-cyan-50/60 p-2.5 text-xs dark:bg-cyan-950/30">
                  <Lock className="mr-1 inline h-3 w-3 text-cyan-700" />
                  开通后将基于您的口味与禁忌,生成 <b className="text-cyan-700">具体菜品</b> 与 <b className="text-cyan-700">名厨做法</b>
                </div>
              </div>
            )}
          </div>

          <MealHeader label="午餐" kcal={560} />
          <MealHeader label="晚餐" kcal={460} />
        </div>
      </section>

      {/* 今日运动 */}
      <section className="mx-3 rounded-2xl bg-gradient-to-b from-cyan-50 to-white p-4 shadow-sm ring-1 ring-cyan-100 dark:from-cyan-950/40 dark:to-transparent dark:ring-cyan-900/40">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">运动方案</h3>
            <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
              通用方案 · 免费
            </span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/40">
            <HeartPulse className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">认知训练建议:每周 ≥150 分钟中等强度有氧,循序渐进</p>

        <div className="mt-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-border/60 dark:bg-card">
          <div className="flex items-center justify-between text-sm">
            <span>今日打卡进度</span>
            <span className="text-primary">完成度</span>
          </div>
          <div className="mt-1 flex items-end justify-between">
            <p className="text-lg"><b>1</b><span className="text-muted-foreground text-sm"> / 2 项</span></p>
            <p className="text-xl font-bold text-primary">50%</p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div className="h-full w-1/2 rounded-full bg-primary" />
          </div>
        </div>

        <button className="mt-2 flex w-full items-center gap-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-600 dark:bg-rose-950/30">
          <AlertTriangle className="h-4 w-4" />
          <span>运动风险提示:胸闷 / 头晕请立即停止,血压 &lt;180/110</span>
          <ChevronDown className="ml-auto h-3 w-3" />
        </button>

        <div className="mt-2 flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-border/60 dark:bg-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <Footprints className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">授权微信步数</p>
            <p className="text-xs text-muted-foreground">同步每日步数,自动计入运动量</p>
          </div>
          <button className="whitespace-nowrap rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white">立即授权</button>
        </div>

        {/* 今日运动清单 */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">今日运动清单</span>
            <span className="rounded-full bg-cyan-100 px-1.5 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">2 项</span>
          </div>
          <button className="text-xs text-primary">打卡记录 ›</button>
        </div>

        <div className="mt-2 space-y-3">
          <ExerciseCard
            done
            gradient="from-amber-300 to-orange-400"
            title="有氧慢走"
            level="入门"
            tags={["#轻度认知障碍", "#血压偏高", "#久坐少动"]}
            time="午餐后 13:00"
            duration="15-20 分钟"
            coach="社区康复指导员 · 06:00"
            goal="1000 步 · 配速 4km/h"
            streak="已连续 12 天"
          />
          <ExerciseCard
            gradient="from-sky-300 to-cyan-400"
            title="下肢静力训练"
            level="入门"
            tags={["#高血压", "#膝关节不适", "#肌少风险"]}
            time="今晚 19:30"
            duration="12 分钟"
            coach="康复治疗师 · 10:00"
            goal="3 组 × 每侧 30 秒"
            streak="已连续 5 天"
          />
        </div>
      </section>


      {/* 健康服务入口 */}
      <section className="mx-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/10">
              <HeartPulse className="h-4 w-4 text-orange-500" />
            </span>
            <h3 className="text-base font-semibold">健康服务</h3>
            <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-600">医师精选</span>
          </div>
          <button onClick={() => setMallOpen(true)} className="inline-flex items-center text-xs text-primary">
            进入服务 <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <button
          onClick={() => setMallOpen(true)}
          className="group relative block w-full overflow-hidden rounded-xl text-left"
        >
          <img
            src={mallBanner}
            alt="健康服务 · 医师精选好物"
            width={1280}
            height={512}
            loading="lazy"
            className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/55 via-orange-900/15 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-between px-3 text-white">
            <div>
              <p className="text-base font-bold drop-shadow">配合方案 · 精选服务</p>
              <p className="text-[11px] opacity-90">器械 · 营养餐 · 监测设备</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-orange-600 shadow">
              逛一逛 ›
            </span>
          </div>
        </button>
      </section>
      </>) : (
        <UnfilledPlanGuide
          onMock={() => setProfileComplete(true)}
          onGoAssessment={() => navigate("/patient/assessment")}
          onGoArchive={() => navigate("/patient/archive")}
        />
      )}


      <PatientActionSheet

        open={mallOpen}
        onOpenChange={setMallOpen}
        title="健康服务"
        description="医师精选 · 配合您的健康方案"
      >
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {mallProducts.map((g) => (
            <div key={g.name} className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border/60">
              <div className="flex h-20 items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-4xl dark:from-orange-950/40 dark:to-amber-950/30">
                {g.emoji}
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-semibold">{g.name}</p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{g.desc}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-orange-600">{g.price}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{g.tag}</span>
                </div>
                <button className="mt-1.5 w-full rounded-full bg-orange-500 py-1 text-[11px] font-semibold text-white">
                  加入购物车
                </button>
              </div>
            </div>
          ))}
        </div>
      </PatientActionSheet>
    </div>
  );
};

function Row({ color, label, val }: { color: string; label: string; val: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${color}`} />{label}</span>
      <span className="font-medium">{val}</span>
    </div>
  );
}

function MealItem({ title, weight, items, tip }: { title: string; weight: string; items: string[]; tip?: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{title}</span>
        <span className="text-xs text-primary">{weight}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span key={i} className="rounded-md bg-white px-2 py-0.5 text-[11px] ring-1 ring-border dark:bg-card">
            {i}
          </span>
        ))}
      </div>
      {tip && <p className="mt-1 text-[11px] text-muted-foreground">提示:{tip}</p>}
    </div>
  );
}

function MealHeader({ label, kcal }: { label: string; kcal: number }) {
  return (
    <button className="flex w-full items-center gap-2 rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-border/60 dark:bg-card">
      <ChevronDown className="h-4 w-4 -rotate-90" />
      <span className="font-semibold">{label}</span>
      <span className="text-muted-foreground">约 {kcal} 千卡</span>
      <span className="ml-auto text-xs text-muted-foreground">· 推荐结构</span>
    </button>
  );
}

function ExerciseCard(props: {
  done?: boolean;
  gradient: string;
  title: string;
  level: string;
  tags: string[];
  time: string;
  duration: string;
  coach: string;
  goal: string;
  streak: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border/60 dark:bg-card">
      <div className={`flex gap-3 bg-gradient-to-br ${props.gradient} p-3`}>
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-white/30 backdrop-blur">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80">
            <Play className="h-6 w-6 fill-current text-primary" />
          </div>
          <span className="absolute left-1 top-1 rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground">通用教学</span>
          <span className="absolute bottom-1 left-1 right-1 truncate rounded-md bg-black/30 px-1.5 py-0.5 text-center text-[10px] text-white">
            {props.coach}
          </span>
        </div>
        <div className="min-w-0 flex-1 text-white">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-bold">{props.title}</p>
            <span className="rounded bg-white/25 px-1.5 py-0.5 text-[10px]">{props.level}</span>
            {props.done && (
              <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold">
                <CheckCircle2 className="h-3 w-3" /> 已完成
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {props.tags.map((t) => (
              <span key={t} className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px]">{t}</span>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] opacity-90">⏱ {props.time} · {props.duration}</p>
        </div>
      </div>

      <div className="space-y-2 p-3">
        <div className="rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground">
          <Lock className="mr-1 inline h-3 w-3" />
          开通专属方案解锁 奥运冠军 1:1 陪练 与个性化强度调整
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground">今日目标</p>
            <p className="text-sm font-semibold">{props.goal}</p>
            <p className="mt-0.5 text-[11px] text-amber-600">🏆 {props.streak}</p>
          </div>
          {props.done ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> 已打卡
            </span>
          ) : (
            <button className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
              ✓ 去打卡
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UnfilledPlanGuide({
  onMock,
  onGoAssessment,
  onGoArchive,
}: {
  onMock: () => void;
  onGoAssessment: () => void;
  onGoArchive: () => void;
}) {
  return (
    <div className="mx-3 -mt-4 space-y-3">
      <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <HeartPulse className="h-4 w-4 text-primary" />
          </span>
          <h3 className="text-base font-semibold">还差一步，即可生成您的健康方案</h3>
        </div>
        <p className="text-sm leading-relaxed text-foreground/85">
          请先补充<b className="text-primary">个人档案</b>与完成<b className="text-primary">必填评估问卷</b>。
          我们将根据您的病史、用药、体检结果与生活方式，为您生成专属的饮食、运动、睡眠与监测方案。
        </p>
      </section>

      <button
        onClick={onGoArchive}
        className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-border/60 active:scale-[0.99]"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">补充个人档案</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">病史、用药、体检报告、家族史等</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </button>

      <button
        onClick={onGoAssessment}
        className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-border/60 active:scale-[0.99]"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">填写评估问卷</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">训练站测评 MMSE / MoCA · 自评 睡眠 / 营养 / 跌倒 / 心理</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </button>

      <button
        onClick={onMock}
        className="w-full rounded-xl border border-dashed border-primary/40 py-2 text-[11px] text-primary"
      >
        （演示）标记为已补充资料，查看示例方案
      </button>
    </div>
  );
}

export default PatientPlan;

