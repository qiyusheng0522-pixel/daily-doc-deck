import { NavLink, Outlet, Link } from "react-router-dom";
import { ArrowLeft, Bell, Brain, ChevronDown, type LucideIcon } from "lucide-react";
import RoleSwitcher from "@/components/RoleSwitcher";

export type PadTab = { to: string; icon: LucideIcon; label: string; end?: boolean };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "上午好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好";
}

/** 医生端 / 社区端共用的横屏 PAD 外壳：左侧导航 + 顶部问候 + 内容区。弹窗定位在内容区内。 */
export default function PadShell({ tabs, name, dept, initial, caption, frameAttr, community = false, hideHeader = false, onBell }: {
  tabs: PadTab[]; name: string; dept: string; initial: string; caption: string; frameAttr: string; community?: boolean; hideHeader?: boolean; onBell?: () => void;
}) {
  const active = community ? "bg-gradient-community" : "bg-gradient-primary";
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-muted px-4 py-6">
      <RoleSwitcher />
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="rounded-[36px] bg-foreground/90 p-3 shadow-2xl">
          <div {...{ [frameAttr]: "" }} className="pad-screen relative flex overflow-hidden rounded-[26px]" style={{ height: 800 }}>
            <aside className="relative flex w-52 shrink-0 flex-col px-4 pb-4 pt-24">
              <nav className="space-y-2">
                {tabs.map(t => (
                  <NavLink key={t.to} to={t.to} end={t.end}
                    className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold transition-colors ${isActive ? `${active} text-primary-foreground shadow-elegant` : "text-foreground/80 hover:bg-card/70"}`}>
                    <t.icon className="h-5 w-5" />{t.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto flex justify-center opacity-60"><Brain className={`h-24 w-24 ${community ? "text-accent/40" : "text-primary/30"}`} strokeWidth={1.2} /></div>
              <Link to="/" className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" />返回首页</Link>
            </aside>
            <div className="flex min-w-0 flex-1 flex-col">
              {!hideHeader && (
                <header className="flex shrink-0 items-center justify-between px-6 pb-3 pt-6">
                  <h1 className="text-2xl font-bold">{name}，{greeting()} 👋</h1>
                  <div className="flex items-center gap-4">
                    <button onClick={onBell} className="relative rounded-full p-2 text-muted-foreground hover:bg-card" aria-label="通知">
                      <Bell className="h-6 w-6" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                    </button>
                    <div className="flex items-center gap-2">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${active} text-base font-bold text-primary-foreground`}>{initial}</div>
                      <div className="leading-tight"><p className="text-sm font-semibold">{name}</p><p className="text-xs text-muted-foreground">{dept}</p></div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </header>
              )}
              <main className="relative min-h-0 flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto pb-4 pr-4">
                  <div className={hideHeader ? "pt-4" : ""}><Outlet /></div>
                </div>
              </main>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">{caption}</p>
      </div>
    </div>
  );
}
