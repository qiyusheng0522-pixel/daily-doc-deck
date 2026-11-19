import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { usePatients, useReferrals, sourceLabel, type Patient } from "@/data/patients";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { pendingDoctorReferral, useDoctorReception } from "@/data/doctorReception";

const DoctorPatients = () => {
  const [q, setQ] = useState("");
  const { data: patients = [], isLoading } = usePatients("all");
  const { data: referrals = [], isLoading: loadingReferrals } = useReferrals();
  const reception = useDoctorReception();
  const receive = (referralId: string) => reception.mutate(referralId, {
    onSuccess: () => toast({ title: "已接收患者" }),
    onError: error => toast({ title: "接收失败", description: error.message }),
  });

  const list = patients.filter((p) => !q || p.name.includes(q) || (p.stroke_type ?? "").includes(q) || p.diagnosis.includes(q));

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
        {isLoading && <p className="p-6 text-center text-sm text-muted-foreground">加载中…</p>}
        {!isLoading && list.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">无匹配患者</p>}
        {list.map((p, i) => (
          <PatientRow key={p.id} p={p} first={i === 0}
            pendingId={pendingDoctorReferral(referrals, p.id)?.id}
            received={!loadingReferrals && referrals.some(r => r.patient_id === p.id && r.direction === "上转" && r.status === "已接收")}
            saving={reception.isPending} onReceive={receive} />
        ))}
      </div>
    </div>
  );
};

function PatientRow({ p, first, pendingId, received, saving, onReceive }: { p: Patient; first: boolean; pendingId?: string; received: boolean; saving: boolean; onReceive: (id: string) => void }) {
  return (
    <div className={first ? "" : "border-t border-border"}>
    <Link
      to={`/doctor/patients/${p.id}`}
      className="flex items-center gap-3 p-4"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold ${
          p.hospital_stage === "历史" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
        }`}
      >
        {p.name[0]}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-foreground">{p.name}</span>
          {p.abnormal && <Tag color="rose">异常</Tag>}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {p.gender} · {p.age}岁 · {p.stroke_type}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">创建于 {p.created_at.slice(0, 16).replace("T", " ")}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Tag color={p.source === "南京市鼓楼医院" ? "primary" : "teal"}>{sourceLabel(p.source)}</Tag>
          <Tag color="slate">{p.hospital_stage ?? p.community_stage ?? "—"}</Tag>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
    {(pendingId || received) && <div className="flex justify-end px-4 pb-3">
      {pendingId ? <Button size="sm" variant="outline" disabled={saving} onClick={() => onReceive(pendingId)}>确认接收</Button>
        : <span className="text-xs text-success">已接收</span>}
    </div>}
    </div>
  );
}

function Tag({
  color,
  icon,
  children,
}: {
  color: "primary" | "amber" | "teal" | "rose" | "slate";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const cls = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    teal: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
    rose: "bg-destructive/10 text-destructive",
    slate: "bg-muted text-muted-foreground",
  }[color];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {icon}
      {children}
    </span>
  );
}

export default DoctorPatients;
