import { Link } from "react-router-dom";
import { Settings, Wallet, Package, Truck, CheckSquare, FileEdit, HeartPulse, FileText, FileCheck, Tag, MapPin, BarChart3, ChevronRight, ArrowLeft } from "lucide-react";

const orderItems = [
  { icon: Wallet, label: "待支付", color: "text-blue-500" },
  { icon: Package, label: "待发货", color: "text-orange-500" },
  { icon: Truck, label: "待收货", color: "text-cyan-500" },
  { icon: CheckSquare, label: "已完成", color: "text-rose-500" },
];

const services = [
  { icon: FileEdit, label: "我的问诊" },
  { icon: HeartPulse, label: "健康档案" },
  { icon: FileText, label: "入院记录" },
  { icon: FileCheck, label: "知情同意书" },
  { icon: Tag, label: "健康标签" },
  { icon: MapPin, label: "收货地址" },
  { icon: BarChart3, label: "我的数据" },
];

const PatientProfile = () => {
  return (
    <div className="min-h-full bg-gradient-to-b from-sky-100 via-sky-50 to-white pb-6 dark:from-sky-950/40 dark:via-sky-950/20 dark:to-background">
      {/* Custom header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="rounded-md p-1 text-muted-foreground hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="text-base font-semibold">我的</p>
        <div className="w-6" />
      </div>

      {/* User card */}
      <div className="mx-4 mt-2 flex items-center gap-3">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-md">
            <HeartPulse className="h-7 w-7" />
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">编辑</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">张伟</span>
            <span className="rounded bg-gradient-to-r from-amber-400 to-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">✦ VIP</span>
            <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">✦ 1,280</span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            建议完善健康档案,给您更精准的… <ChevronRight className="h-3 w-3" />
          </p>
        </div>
        <button className="rounded-full p-2 text-muted-foreground hover:bg-muted">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Orders */}
      <div className="mx-4 mt-4 rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold">我的订单</p>
          <button className="flex items-center text-xs text-muted-foreground">
            全部订单 <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {orderItems.map((it) => (
            <button key={it.label} className="flex flex-col items-center gap-1">
              <it.icon className={`h-6 w-6 ${it.color}`} />
              <span className="text-xs text-muted-foreground">{it.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="mx-4 mt-4 rounded-2xl bg-card p-4 shadow-sm">
        <p className="mb-3 font-semibold">我的服务</p>
        <div className="grid grid-cols-4 gap-y-4">
          {services.map((s) => (
            <button key={s.label} className="flex flex-col items-center gap-1">
              <s.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Health tags */}
      <div className="mx-4 mt-4 rounded-2xl bg-card p-4 shadow-sm">
        <p className="mb-2 font-semibold">健康标签</p>
        <div className="flex flex-wrap gap-2">
          {["轻度认知障碍", "高血压 10 年", "高脂血症", "同型半胱氨酸偏高", "戒烟中"].map((t) => (
            <span key={t} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
