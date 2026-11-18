import type { ReactNode } from "react";

export const C = {
  cyan: "hsl(var(--scr-cyan))", green: "hsl(var(--scr-green))", gold: "hsl(var(--scr-gold))",
  red: "hsl(var(--scr-red))", blue: "hsl(210 90% 58%)", purple: "hsl(265 80% 70%)",
  dim: "hsl(var(--scr-dim))", grid: "hsl(var(--scr-line) / 0.2)",
};

export const tip = { contentStyle: { background: "hsl(var(--scr-panel))", border: "1px solid hsl(var(--scr-line))", color: "hsl(var(--scr-text))", fontSize: 12 } };
export const axis = { stroke: C.dim, fontSize: 11, tickLine: false, axisLine: { stroke: C.grid } } as const;

export function Panel({ title, sub, extra, children, className = "" }: { title: string; sub?: string; extra?: ReactNode; children: ReactNode; className?: string }) {
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

export function Legend({ items }: { items: { c: string; k: string }[] }) {
  return (
    <div className="flex justify-center gap-4 text-[11px] text-scr-dim">
      {items.map((i) => <span key={i.k} className="flex items-center gap-1"><span className="h-1 w-4 rounded" style={{ background: i.c }} />{i.k}</span>)}
    </div>
  );
}

