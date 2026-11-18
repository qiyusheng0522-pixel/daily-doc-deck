import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MonitorDot, Stethoscope, HeartPulse, Building2, Smartphone, ChevronDown, X } from "lucide-react";

const roles = [
  { to: "/screen", label: "管理", icon: MonitorDot, color: "bg-sky-600" },
  { to: "/doctor", label: "指导中心", icon: Stethoscope, color: "bg-blue-500" },
  { to: "/nurse", label: "评估师", icon: HeartPulse, color: "bg-pink-500" },
  { to: "/community", label: "训练站", icon: Building2, color: "bg-emerald-500" },
  { to: "/patient", label: "服务对象", icon: Smartphone, color: "bg-violet-500" },
];

const RoleSwitcher = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const active = roles.find((r) => location.pathname.startsWith(r.to)) ?? roles[4];
  const ActiveIcon = active.icon;

  return (
    <div className="fixed right-4 top-4 z-[100]">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-lg hover:bg-muted"
        >
          <span className={`flex h-5 w-5 items-center justify-center rounded-full ${active.color} text-white`}>
            <ActiveIcon className="h-3 w-3" />
          </span>
          切换端 · {active.label}
          <ChevronDown className="h-3 w-3" />
        </button>
      ) : (
        <div className="w-40 rounded-xl border bg-card p-2 shadow-2xl">
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-muted-foreground">切换角色</span>
            <button onClick={() => setOpen(false)} className="rounded p-0.5 hover:bg-muted">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-1">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = active.to === r.to;
              return (
                <Link
                  key={r.to}
                  to={r.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted ${
                    isActive ? "bg-primary/10 font-semibold text-primary" : ""
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${r.color} text-white`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {r.label}端
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSwitcher;
