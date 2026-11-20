import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function TrainingRecordPanel({ title, children, className, height = "h-72" }: { title: ReactNode; children: ReactNode; className?: string; height?: string }) {
  return <section className={cn("min-w-0 overflow-hidden rounded-lg border bg-card text-card-foreground", className)}>
    <div className="flex min-h-16 items-center justify-between gap-3 border-b bg-primary/5 px-4 py-2">{title}</div>
    <div tabIndex={0} aria-label="训练记录列表" className={cn("overflow-y-auto overscroll-contain px-4 [scrollbar-gutter:stable] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring", height)}>{children}</div>
  </section>;
}