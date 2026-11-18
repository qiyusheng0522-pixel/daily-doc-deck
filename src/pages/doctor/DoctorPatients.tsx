import { useState } from "react";
import { Link } from "react-router-dom";
import { doctorPatients } from "@/data/doctorMock";
import { Search, ChevronRight, MessageSquare, Users } from "lucide-react";

const DoctorPatients = () => {
  const [q, setQ] = useState("");
  const list = doctorPatients.filter((p) => !q || p.name.includes(q) || p.strokeType.includes(q));

  return (
    <div className="px-4 py-3">
      <div className="mb-3 flex items-center gap-2 rounded-full bg-card px-4 py-2.5 shadow-sm ring-1 ring-border/60">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索患者姓名或诊断"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="rounded-2xl bg-card shadow-sm ring-1 ring-border/60">
        {list.map((p, i) => (
          <Link
            key={p.id}
            to={`/doctor/patients/${p.id}`}
            className={`flex items-center gap-3 p-4 ${i > 0 ? "border-t border-border" : ""}`}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold ${
                p.status === "过期" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
              }`}
            >
              {p.initial}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-foreground">{p.name}</span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {p.gender} · {p.age}岁 · {p.strokeType}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">创建于 {p.createdAt}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Tag color="primary" icon={<MessageSquare className="h-3 w-3" />}>沟通</Tag>
                <Tag color="amber" icon={<Users className="h-3 w-3" />}>会诊</Tag>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
};

function Tag({ color, icon, children }: { color: "primary" | "amber"; icon?: React.ReactNode; children: React.ReactNode }) {
  const cls =
    color === "primary"
      ? "bg-primary/10 text-primary"
      : "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {icon}
      {children}
    </span>
  );
}

export default DoctorPatients;
