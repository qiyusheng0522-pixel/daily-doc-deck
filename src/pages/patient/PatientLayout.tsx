import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, Bot, Utensils, User, ArrowLeft, Bell, Wifi, Signal, BatteryFull } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import RoleSwitcher from "@/components/RoleSwitcher";

const tabs = [
  { to: "/patient", icon: Home, label: "首页", end: true },
  { to: "/patient/assessment", icon: ClipboardList, label: "评估" },
  { to: "/patient/ai", icon: Bot, label: "AI 助手", center: true },
  { to: "/patient/plan", icon: Utensils, label: "方案" },
  { to: "/patient/profile", icon: User, label: "我的" },
];

const titleMap: Record<string, string> = {
  "/patient": "首页",
  "/patient/assessment": "健康评估",
  "/patient/ai": "AI 助手",
  "/patient/plan": "健康方案",
  "/patient/profile": "我的",
};

const PatientLayout = () => {
  const location = useLocation();
  const title = titleMap[location.pathname] ?? "首页";
  const hideHeader = location.pathname === "/patient" || location.pathname === "/patient/ai" || location.pathname === "/patient/profile";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 px-4 py-6 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <RoleSwitcher />
      <div className="mx-auto text-[15px] leading-relaxed" style={{ width: 408 }}>
        <div className="phone-shell">
          <span className="phone-side-left" />
          <div data-patient-frame className="phone-screen relative flex flex-col" style={{ height: 820 }}>
            <div className="phone-notch" />
            <div className="phone-statusbar">
              <span>9:41</span>
              <span className="flex items-center gap-1.5 text-foreground/80">
                <Signal className="h-3.5 w-3.5" />
                <Wifi className="h-3.5 w-3.5" />
                <BatteryFull className="h-3.5 w-3.5" />
              </span>
            </div>

            {!hideHeader && (
              <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card/95 backdrop-blur px-4 py-3">
                <Link to="/" className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-base font-semibold">{title}</h1>
                <button
                  onClick={() => toast({ title: "您有 2 条随访提醒", description: "请前往查看" })}
                  className="relative rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-destructive" />
                </button>
              </header>
            )}

            <main className="flex-1 overflow-y-auto pb-20">
              <Outlet />
            </main>

            <nav className="absolute bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md">
              <div className="grid grid-cols-5 items-end">
                {tabs.map((t) => (
                  <NavLink
                    key={t.to}
                    to={t.to}
                    end={t.end}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] transition-colors ${
                        t.center ? "-mt-6" : ""
                      } ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
                    }
                  >
                    {t.center ? (
                      <>
                        <span className="mb-0.5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-lg">
                          <t.icon className="h-6 w-6" />
                        </span>
                        <span>{t.label}</span>
                      </>
                    ) : (
                      <>
                        <t.icon className="h-5 w-5" />
                        <span>{t.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
              <div className="flex justify-center pb-1.5 pt-1">
                <span className="h-1 w-24 rounded-full bg-foreground/40" />
              </div>
            </nav>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">用户端小程序 · 移动端预览 (iPhone 15)</p>
      </div>
    </div>
  );
};

export default PatientLayout;
