import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { usePatients } from "@/data/patients";
import { doctorPlanQueues } from "@/data/doctorPlanQueue";
import type { Advice } from "@/components/cognitive/AiAdvicePanel";

const risks = ["全部风险", "中风险", "高风险"] as const;

export { isPendingReview } from "@/data/doctorPlanQueue";

const DoctorPlans = () => {
  const [params] = useSearchParams();
  const reviewed = params.get("status") === "reviewed";
  const [risk, setRisk] = useState<(typeof risks)[number]>("全部风险");
  const [q, setQ] = useState("");
  const { data: patients = [], isLoading } = usePatients("all");
  const queues = doctorPlanQueues(patients);
  const list = (reviewed ? queues.reviewed : queues.pending)
    .filter((p) => risk === "全部风险" || p.cognitive_risk === risk)
    .filter((p) => !q || p.name.includes(q));

  return (
    <div className="space-y-3 px-4 py-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{reviewed ? "转诊办理" : "方案审核"}</h2>
        <span className="text-sm text-muted-foreground">共 {list.length} 位患者</span>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 shadow-sm ring-1 ring-border/60">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索患者姓名" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <div className="flex gap-2">{risks.map((r) => <Button key={r} size="sm" variant={risk === r ? "default" : "outline"} onClick={() => setRisk(r)}>{r}</Button>)}</div>
      {isLoading ? <p className="text-sm text-muted-foreground">加载中…</p> : list.length === 0 ? <p className="text-sm text-muted-foreground">{reviewed ? "暂无已完成方案审核的患者" : "暂无待审核方案"}</p> : (
        <ul className="space-y-3">
          {list.map((p) => {
            const a = p.ai_plan as Advice;
            return (
              <li key={p.id}>
                <Link to={reviewed ? `/doctor/patients/${p.id}` : `/doctor/plans/${p.id}`} className="block rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">{p.name}</span>
                    <span className={`rounded-md px-1.5 py-0.5 text-[15.4px] ${p.cognitive_risk === "高风险" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}>{p.cognitive_risk}</span>
                    <span className="ml-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[15.4px] text-primary">{reviewed ? "已审核 · 转诊办理 >" : "待审核"}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.gender} · {p.age}岁{p.ai_plan_at ? ` · 方案生成于 ${new Date(p.ai_plan_at).toLocaleDateString("zh-CN")}` : ""}</p>
                  {a?.summary && <p className="mt-2 line-clamp-2 text-sm text-foreground/90">{a.summary}</p>}
                  {!!a?.training?.length && <div className="mt-2 flex flex-wrap gap-1">{a.training.slice(0, 4).map((t, i) => <span key={i} className="rounded bg-accent/10 px-1.5 py-0.5 text-[15.4px] text-accent">{t.domain}</span>)}</div>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
export default DoctorPlans;
