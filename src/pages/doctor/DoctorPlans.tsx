import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { usePatients } from "@/data/patients";
import { needsReferral, planConfirmed } from "@/data/cognitive";
import type { Advice } from "@/components/cognitive/AiAdvicePanel";

const tabs = ["全部", "待确认", "已确认"] as const;
const risks = ["全部风险", "中风险", "高风险"] as const;

/** 只列中、高风险（经转诊由上级医生确认治疗方案）的老人 */
const DoctorPlans = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("全部");
  const [risk, setRisk] = useState<(typeof risks)[number]>("全部风险");
  const [q, setQ] = useState("");
  const { data: patients = [], isLoading } = usePatients("all");
  const list = patients
    .filter((p) => needsReferral(p.cognitive_risk))
    .filter((p) => (tab === "全部" ? true : tab === "待确认" ? !planConfirmed(p) : planConfirmed(p)))
    .filter((p) => risk === "全部风险" || p.cognitive_risk === risk)
    .filter((p) => !q || p.name.includes(q));

  return (
    <div className="space-y-3 px-4 py-3">
      <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 shadow-sm ring-1 ring-border/60">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索患者姓名" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <div className="flex gap-2">
        {tabs.map((t) => (
          <Button variant="outline" size="sm" key={t} onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${tab === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-border"}`}>{t}</Button>
        ))}
      </div>
      <div className="flex gap-2">{risks.map((r) => <Button key={r} size="sm" variant={risk === r ? "default" : "outline"} onClick={() => setRisk(r)}>{r}</Button>)}</div>
      {isLoading ? <p className="text-sm text-muted-foreground">加载中…</p> : list.length === 0 ? <p className="text-sm text-muted-foreground">暂无方案</p> : (
        <ul className="space-y-3">
          {list.map((p) => {
            const a = p.ai_plan as Advice; const ok = planConfirmed(p);
            return (
              <li key={p.id}>
                <Link to={`/doctor/plans/${p.id}`} className="block rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">{p.name}</span>
                    <span className={`rounded-md px-1.5 py-0.5 text-[11px] ${p.cognitive_risk === "高风险" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}>{p.cognitive_risk}</span>
                    <span className={`ml-auto rounded-md px-1.5 py-0.5 text-[11px] ${ok ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`}>{ok ? "已确认" : p.ai_plan ? "待确认" : "待生成"}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.cognitive_diagnosis ?? "待确诊"}{p.ai_plan_at ? ` · ${new Date(p.ai_plan_at).toLocaleDateString("zh-CN")}` : ""}</p>
                  {a?.summary && <p className="mt-2 line-clamp-2 text-sm text-foreground/90">{a.summary}</p>}
                  {!!a?.training?.length && <div className="mt-2 flex flex-wrap gap-1">{a.training.slice(0, 4).map((t, i) => <span key={i} className="rounded bg-accent/10 px-1.5 py-0.5 text-[11px] text-accent">{t.domain}</span>)}</div>}
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
