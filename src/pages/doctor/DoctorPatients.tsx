import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { usePatients, useReferrals, sourceLabel, type Patient } from "@/data/patients";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { filterDoctorPatients, pendingDoctorReferral, useDoctorReception, type DoctorPatientFilters } from "@/data/doctorReception";

const DoctorPatients = () => {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Omit<DoctorPatientFilters, "query">>({ reception: "在管患者", risk: "全部", source: "全部", gender: "全部" });
  const { data: patients = [], isLoading } = usePatients("all");
  const { data: referrals = [], isLoading: loadingReferrals } = useReferrals();
  const reception = useDoctorReception();
  const receive = (referralId: string) => reception.mutate(referralId, {
    onSuccess: () => {
      setFilters(previous => ({ ...previous, reception: "在管患者" }));
      toast({ title: "患者已加入患者列表" });
    },
    onError: error => toast({ title: "接收失败", description: error.message }),
  });

  const list = filterDoctorPatients(patients.filter(p => p.cognitive_risk !== "低风险"), referrals, { ...filters, query: q });

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

      <div className="mb-3 grid grid-cols-2 gap-2">
        <FilterSelect label="接收筛选" value={filters.reception} options={["在管患者", "待接收", "全部患者"]} onChange={value => setFilters(previous => ({ ...previous, reception: value as DoctorPatientFilters["reception"] }))} />
        <FilterSelect label="风险等级" value={filters.risk} options={["全部", "中风险", "高风险"]} allLabel="全部风险" onChange={value => setFilters(previous => ({ ...previous, risk: value }))} />
        <FilterSelect label="来源渠道" value={filters.source} options={["全部", "南京市鼓楼医院", "小市社区"]} allLabel="全部来源" onChange={value => setFilters(previous => ({ ...previous, source: value }))} />
        <FilterSelect label="性别" value={filters.gender} options={["全部", "男", "女"]} allLabel="全部性别" onChange={value => setFilters(previous => ({ ...previous, gender: value }))} />
      </div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>共 {list.length} 位患者</span>
        <Button variant="ghost" size="sm" onClick={() => { setQ(""); setFilters({ reception: "在管患者", risk: "全部", source: "全部", gender: "全部" }); }}>重置筛选</Button>
      </div>
      <div className="rounded-2xl bg-card shadow-sm ring-1 ring-border/60">
        {(isLoading || loadingReferrals) && <p className="p-6 text-center text-sm text-muted-foreground">加载中…</p>}
        {!isLoading && !loadingReferrals && list.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">无匹配患者</p>}
        {!loadingReferrals && list.map((p, i) => (
          <PatientRow key={p.id} p={p} first={i === 0}
            pendingId={pendingDoctorReferral(referrals, p.id)?.id}
            saving={reception.isPending} onReceive={receive} />
        ))}
      </div>
    </div>
  );
};

function FilterSelect({ label, value, options, allLabel, onChange }: { label: string; value: string; options: string[]; allLabel?: string; onChange: (value: string) => void }) {
  return <Select value={value} onValueChange={onChange}>
    <SelectTrigger aria-label={label} className="min-w-0 bg-card text-xs"><SelectValue /></SelectTrigger>
    <SelectContent>{options.map(option => <SelectItem key={option} value={option}>{option === "全部" ? allLabel : option}</SelectItem>)}</SelectContent>
  </Select>;
}

function PatientRow({ p, first, pendingId, saving, onReceive }: { p: Patient; first: boolean; pendingId?: string; saving: boolean; onReceive: (id: string) => void }) {
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
          {p.cognitive_risk && <Tag color={p.cognitive_risk === "高风险" ? "rose" : p.cognitive_risk === "中风险" ? "amber" : "teal"}>{p.cognitive_risk}</Tag>}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {p.gender} · {p.age}岁
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">创建于 {p.created_at.slice(0, 16).replace("T", " ")}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Tag color={p.source === "南京市鼓楼医院" ? "primary" : "teal"}>{sourceLabel(p.source)}</Tag>
          <Tag color="slate">{p.hospital_stage ?? p.community_stage ?? "—"}</Tag>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
    {pendingId && <div className="flex justify-end px-4 pb-3">
      <Button size="sm" variant="outline" disabled={saving} onClick={() => onReceive(pendingId)}>接收</Button>
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
    amber: "bg-warning/15 text-warning",
    teal: "bg-success/15 text-success",
    rose: "bg-destructive/10 text-destructive",
    slate: "bg-muted text-muted-foreground",
  }[color];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[15.4px] font-medium ${cls}`}>
      {icon}
      {children}
    </span>
  );
}

export default DoctorPatients;
