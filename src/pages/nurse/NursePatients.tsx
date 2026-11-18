import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ChevronRight, MessageSquare, Users as UsersIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePatients, sourceLabel, type HospitalStage } from "@/data/patients";

const stageTabs: ("全部" | HospitalStage)[] = ["全部", "待入院", "院中", "待出院", "历史"];

const NursePatients = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>(params.get("filter") || "全部");
  const [conditionFilter, setConditionFilter] = useState<string>("全部疾病");

  const { data: allPatients = [], isLoading } = usePatients("hospital");

  const conditions = useMemo(() => {
    const set = new Set<string>(["全部疾病"]);
    allPatients.forEach((p) => p.condition_category && set.add(p.condition_category));
    return Array.from(set);
  }, [allPatients]);

  const list = useMemo(
    () =>
      allPatients
        .filter((p) => {
          const ms = !search || p.name.includes(search) || (p.bed_number ?? "").includes(search);
          const mf = filter === "全部" || p.hospital_stage === filter;
          const mc = conditionFilter === "全部疾病" || p.condition_category === conditionFilter;
          return ms && mf && mc;
        })
        .sort((a, b) => Number(b.abnormal) - Number(a.abnormal)),
    [allPatients, search, filter, conditionFilter],
  );

  const stageCount = (s: HospitalStage) => allPatients.filter((p) => p.hospital_stage === s).length;

  return (
    <div className="space-y-3 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索患者姓名/床位"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-8 text-sm"
        />
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {stageTabs.map((t) => {
          const active = filter === t;
          const count = t === "全部" ? allPatients.length : stageCount(t);
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {t}
              <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-white/20" : "bg-muted text-muted-foreground"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
        {conditions.map((c) => {
          const active = conditionFilter === c;
          return (
            <button
              key={c}
              onClick={() => setConditionFilter(c)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] transition-colors ${
                active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">患者列表</h3>
          <span className="text-xs text-muted-foreground">{list.length} 位</span>
        </div>
        <div className="divide-y">
          {isLoading && <p className="px-4 py-10 text-center text-sm text-muted-foreground">加载中…</p>}
          {!isLoading && list.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted-foreground">无匹配患者</p>}
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/nurse/patients/${p.id}`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <div className="relative shrink-0">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold ${
                    p.abnormal ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"
                  }`}
                >
                  {p.name[0]}
                </div>
                <div className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-warning text-[8px] text-white">
                  <UsersIcon className="h-2.5 w-2.5" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold">{p.name}</span>
                  {p.vip && <Badge className="h-4 bg-amber-500/15 px-1 text-[9px] text-amber-700">VIP</Badge>}
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">我负责</span>
                  {p.abnormal && <Badge variant="destructive" className="h-4 px-1 text-[9px]">异常</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      p.source === "南京市鼓楼医院" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                    }`}
                  >
                    {sourceLabel(p.source)}
                  </span>
                  <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">{p.condition_category}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{p.hospital_stage}</span>
                  {p.bed_number && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">床 {p.bed_number}</span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="rounded bg-muted/70 px-1.5 py-0.5">血压 {p.bp}</span>
                  <span className="rounded bg-muted/70 px-1.5 py-0.5">NIHSS {p.nihss}</span>
                  <span className="rounded bg-muted/70 px-1.5 py-0.5">mRS {p.mrs}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/nurse/chat/patient/${p.id}`);
                    }}
                    className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10px] text-primary"
                  >
                    <MessageSquare className="h-3 w-3" />
                    沟通
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-warning/30 bg-warning/5 px-2 py-0.5 text-[10px] text-warning">
                    <UsersIcon className="h-3 w-3" />
                    会诊
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default NursePatients;
