import type { ReactNode } from "react";

export const C = {
  cyan: "hsl(var(--scr-cyan))", green: "hsl(var(--scr-green))", gold: "hsl(var(--scr-gold))",
  red: "hsl(var(--scr-red))", blue: "hsl(var(--scr-blue))", purple: "hsl(var(--scr-violet))",
  dim: "hsl(var(--scr-dim))", grid: "hsl(var(--scr-line) / 0.2)",
};

export const tip = { contentStyle: { background: "hsl(var(--scr-panel))", border: "1px solid hsl(var(--scr-line))", color: "hsl(var(--scr-text))", fontSize: 16.8 } };
export const axis = { stroke: C.dim, fontSize: 15.4, tickLine: false, axisLine: { stroke: C.grid } } as const;

export function Panel({ title, sub, extra, children, className = "" }: { title: string; sub?: string; extra?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`scr-panel flex flex-col overflow-hidden ${className}`}>
      <header className="scr-title flex items-center justify-between px-3 py-1.5">
        <h3 className="flex min-w-0 flex-wrap items-center gap-2 text-[21px] font-bold text-scr-text"><span aria-hidden className="h-3.5 w-1 shrink-0 rounded-sm bg-scr-cyan shadow-[0_0_8px_hsl(var(--scr-cyan)/0.8)]" />{title}{sub && <span className="text-xs font-normal text-scr-dim">{sub}</span>}</h3>
        {extra}
      </header>
      <div className="min-h-0 flex-1 p-2">{children}</div>
    </section>
  );
}

export function Legend({ items }: { items: { c: string; k: string }[] }) {
  return (
    <div className="flex justify-center gap-4 text-[15.4px] text-scr-dim">
      {items.map((i) => <span key={i.k} className="flex items-center gap-1"><span className="h-1 w-4 rounded" style={{ background: i.c }} />{i.k}</span>)}
    </div>
  );
}

