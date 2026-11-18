import { useState } from "react";
import { Link } from "react-router-dom";
import { planReviews } from "@/data/doctorMock";
import { Search } from "lucide-react";

const tabs = ["全部", "待审核", "已审核"] as const;

const DoctorPlans = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("全部");
  const [q, setQ] = useState("");

  const list = planReviews
    .filter((r) => (tab === "全部" ? true : tab === "待审核" ? r.status === "审核中" : r.status !== "审核中"))
    .filter((r) => !q || r.patientName.includes(q));

  return (
    <div className="space-y-3 px-4 py-3">
      <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 shadow-sm ring-1 ring-border/60">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索患者姓名"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-border"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {list.map((r) => (
          <li key={r.id}>
            <Link to={`/doctor/plans/${r.id}`} className="block rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">{r.patientName}</span>
                    <span
                      className={`whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                        r.status === "已审核" || r.status === "已通过"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.department} · {r.submittedAt}</p>
                  <p className="mt-1 text-xs font-medium text-primary">{r.disease}</p>
                </div>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                <span className="font-semibold">普通评估：</span>
                <span className="text-muted-foreground">{r.summary}</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorPlans;
