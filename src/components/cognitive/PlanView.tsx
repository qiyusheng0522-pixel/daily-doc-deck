import { Dumbbell, CalendarCheck, HeartHandshake, AlertTriangle } from "lucide-react";
import type { Advice } from "@/components/cognitive/AiAdvicePanel";

/** 认知治疗方案的统一展示：患者详情与方案审核共用，保证内容一致 */
export default function PlanView({ advice }: { advice: Advice }) {
  return (
    <div className="space-y-3 text-sm">
            <p className="rounded-lg bg-primary/5 p-2.5 leading-relaxed">{advice.summary}</p>
            {advice.focus.length > 0 && (
              <ul className="list-disc space-y-0.5 pl-4 text-xs">{advice.focus.map((f) => <li key={f}>{f}</li>)}</ul>
            )}
            {advice.interventions?.map((item, i) => (
              <section key={`${item.category}-${i}`} className="border-b pb-3 last:border-0">
                <h4 className="mb-1.5 text-sm font-semibold text-primary">{item.category}</h4>
                <ul className="list-disc space-y-1 pl-4 text-xs">{item.actions.map((action, j) => <li key={j}>{action}</li>)}</ul>
                <p className="mt-1 text-xs text-muted-foreground">{item.frequency} · {item.duration}</p>
              </section>
            ))}
            <section>
              <h4 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground"><Dumbbell className="h-3.5 w-3.5" />认知训练</h4>
              <ul className="space-y-1.5">
                {advice.training.map((t, i) => (
                  <li key={i} className="rounded-lg border p-2">
                    <div className="flex items-center justify-between"><span className="font-medium">{t.domain}</span><span className="text-[11px] text-muted-foreground">{t.setting}</span></div>
                    <p className="text-xs">{t.activity}</p>
                    <p className="text-[11px] text-muted-foreground">{t.frequency} · {t.duration}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h4 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground"><CalendarCheck className="h-3.5 w-3.5" />随访安排</h4>
              <p className="text-xs">随访：{advice.followup.cycle}；复评：{advice.followup.reassess}</p>
              <ul className="mt-1 list-disc pl-4 text-xs">{advice.followup.items.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
            <section>
              <h4 className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground"><HeartHandshake className="h-3.5 w-3.5" />照护者要点</h4>
              <ul className="list-disc pl-4 text-xs">{advice.caregiver_tips.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
            {advice.red_flags.length > 0 && (
              <section className="rounded-lg bg-destructive/10 p-2">
                <h4 className="flex items-center gap-1 text-xs font-semibold text-destructive"><AlertTriangle className="h-3.5 w-3.5" />需警惕/及时上转</h4>
                <ul className="list-disc pl-4 text-xs">{advice.red_flags.map((x) => <li key={x}>{x}</li>)}</ul>
              </section>
            )}
    </div>
  );
}
