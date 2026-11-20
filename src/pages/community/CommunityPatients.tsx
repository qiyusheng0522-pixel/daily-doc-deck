import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ChevronRight, UserPlus, Plus, ClipboardCheck } from "lucide-react";
import NewPatientScreening from "@/components/community/NewPatientScreening";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { usePatients, useReferrals, useReceiveReferral } from "@/data/patients";
import { filterCommunityPatients, pendingCommunityReferral } from "@/data/communityReception";
import type { DoctorPatientFilters } from "@/data/doctorReception";
import { upwardReferralState } from "@/data/referralApproval";
import { useCommunityWork } from "@/data/useCommunityWork";

const CommunityPatients = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const work = useCommunityWork();
  const workMode = params.get("work");
  const [filters, setFilters] = useState<Omit<DoctorPatientFilters, "query" | "reception">>({ risk: "全部", source: "全部", gender: "全部" });
  const receptionFilter = params.get("tab") === "new" ? "待接收" : params.get("tab") === "managed" ? "在管患者" : "全部患者";
  const abnormal = params.get("tab") === "abnormal";
  const riskOnly = params.get("tab") === "risk";
  const screened = !riskOnly && !abnormal && !workMode && receptionFilter !== "待接收";
  const { data: patients = [], isLoading } = usePatients("all");
  const { data: referrals = [], isLoading: loadingReferrals } = useReferrals();
  const receive = useReceiveReferral();
  const workIds = new Set((workMode === "assessment" ? work.assessment : workMode === "training" ? work.training : work.community).map(p => p.id));
  const list = filterCommunityPatients(patients, referrals, { ...filters, query, reception: receptionFilter, abnormal, riskOnly, screened }).filter(p => !workMode || workIds.has(p.id));
  const reset = () => { setQuery(""); setFilters({ risk: "全部", source: "全部", gender: "全部" }); setParams(riskOnly ? { tab: "risk" } : abnormal ? { tab: "abnormal" } : {}); };
  return <div className="px-4 py-3">
    <div className="mb-3 flex gap-2">{[{ key: "assessment", label: "待评估患者", count: work.assessment.length }, { key: "training", label: "待训练患者", count: work.training.length }].map(t => <Button key={t.key} variant={workMode === t.key ? "default" : "outline"} onClick={() => setParams({ work: t.key })}>{t.label}（{t.count}）</Button>)}</div>
    <div className="mb-3 grid grid-cols-2 gap-2">
      {[{ key: "screen", label: "初筛", desc: "所有完成 AD-8 初筛的目标用户" }, { key: "risk", label: "风险患者", desc: "AD-8 筛查阳性（≥ 2 分）" }].map(t => <button key={t.key} onClick={() => setParams(t.key === "risk" ? { tab: "risk" } : {})} className={`rounded-xl border px-4 py-3 text-left shadow-sm transition ${riskOnly === (t.key === "risk") ? t.key === "risk" ? "border-destructive/40 bg-destructive/5 ring-1 ring-destructive/30" : "border-success/40 bg-success/5 ring-1 ring-success/30" : "border-border/60 bg-card"}`}><p className={`text-base font-bold ${riskOnly === (t.key === "risk") ? t.key === "risk" ? "text-destructive" : "text-success" : ""}`}>{t.label}</p><p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p></button>)}
    </div>
    <div className="relative mb-3"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索患者姓名" className="rounded-full bg-card pl-9 text-sm" /></div>
    <div className="mb-3 grid grid-cols-2 gap-2">
      <FilterSelect label="接收筛选" value={receptionFilter} options={riskOnly || workMode ? ["全部患者"] : ["全部患者", "在管患者", "待接收"]} onChange={v => { if (workMode) return; setParams(v === "待接收" ? { tab: "new" } : v === "在管患者" ? { tab: "managed" } : riskOnly ? { tab: "risk" } : abnormal ? { tab: "abnormal" } : {}); }} />
      <FilterSelect label="风险等级" value={filters.risk} options={["全部", "低风险", "中风险", "高风险"]} allLabel="全部风险" onChange={v => setFilters(f => ({ ...f, risk: v }))} />
      <FilterSelect label="来源渠道" value={filters.source} options={["全部", "南京市鼓楼医院", "小市社区"]} allLabel="全部来源" onChange={v => setFilters(f => ({ ...f, source: v }))} />
      <FilterSelect label="性别" value={filters.gender} options={["全部", "男", "女"]} allLabel="全部性别" onChange={v => setFilters(f => ({ ...f, gender: v }))} />
    </div>
    <div className="relative mb-3 flex items-center gap-4 overflow-hidden rounded-xl border border-success/30 bg-success/5 px-5 py-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"><UserPlus className="h-7 w-7" /></div>
      <div className="min-w-0 flex-1"><p className="text-lg font-bold">新增患者并进行认知初筛</p><p className="mt-1 text-sm text-muted-foreground">填写基本信息后，完成 AD-8（认知功能初筛量表）评估，快速识别认知风险</p></div>
      <ClipboardCheck className="absolute right-48 top-1/2 h-20 w-20 -translate-y-1/2 rotate-12 text-success/20" />
      <Button className="relative h-11 bg-gradient-community px-6 text-base shadow-soft" onClick={() => setAdding(true)}><Plus className="mr-1 h-5 w-5" />新增并初筛</Button>
    </div>
    <NewPatientScreening open={adding} onClose={() => setAdding(false)} />
    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground"><span>{workMode === "assessment" ? "待评估 · " : workMode === "training" ? "今日待训练 · " : riskOnly ? "AD-8 筛查阳性 · " : "已完成初筛 · "}共 {list.length} 位患者</span><Button variant="ghost" size="sm" onClick={() => { setQuery(""); setFilters({ risk: "全部", source: "全部", gender: "全部" }); if (!workMode) reset(); }}>重置筛选</Button></div>
    <div className="divide-y divide-border rounded-lg bg-card shadow-sm ring-1 ring-border/60">
      {(isLoading || loadingReferrals) && <p className="p-6 text-center text-sm text-muted-foreground">加载中…</p>}
      {!isLoading && !loadingReferrals && !list.length && <p className="p-6 text-center text-sm text-muted-foreground">无匹配患者</p>}
      {!loadingReferrals && list.map(p => { const pending = pendingCommunityReferral(referrals, p.id); const transfer = upwardReferralState(referrals, p.id); return <div key={p.id}>
        {transfer && <p className="px-4 pt-3 text-xs text-primary">转诊：{transfer}</p>}
        <Link to={`/community/patients/${p.id}`} className="flex items-center gap-3 p-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/10 text-base font-semibold text-success">{p.name[0]}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-base font-semibold">{p.name}</span>{p.cognitive_risk && <span className={`rounded-full px-2 py-0.5 text-[15.4px] ${p.cognitive_risk === "高风险" ? "bg-destructive/10 text-destructive" : p.cognitive_risk === "中风险" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{p.cognitive_risk}</span>}</div><p className="mt-0.5 text-sm text-muted-foreground">{p.gender} · {p.age}岁</p><p className="mt-0.5 text-xs text-muted-foreground">创建于 {p.created_at.slice(0, 16).replace("T", " ")}</p><div className="mt-2 flex flex-wrap gap-1.5"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-[15.4px] text-primary">{p.source}</span>{!pending && p.community_stage && <span className="rounded-full bg-muted px-2 py-0.5 text-[15.4px] text-muted-foreground">{p.community_stage}</span>}</div></div><ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" /></Link>
        {pending && <div className="flex justify-end px-4 pb-3"><Button size="sm" variant="outline" disabled={receive.isPending} onClick={() => receive.mutate({ referralId: pending.id, patientId: p.id }, { onSuccess: () => { setParams({ tab: "managed" }); toast({ title: "患者已加入社区患者列表" }); }, onError: e => toast({ title: "接收失败", description: e.message, variant: "destructive" }) })}>确认接收</Button></div>}
        {workMode && <div className="flex justify-end px-4 pb-3"><Button asChild size="sm" variant="outline"><Link to={`/community/patients/${p.id}?tab=${workMode === "assessment" ? "scale&action=ad8" : "training"}`}>{workMode === "assessment" ? "评估" : "去处理"}</Link></Button></div>}
      </div>; })}
    </div>
  </div>;
};
function FilterSelect({ label, value, options, allLabel, onChange }: { label: string; value: string; options: string[]; allLabel?: string; onChange: (value: string) => void }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className="min-w-0 bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o === "全部" ? allLabel : o}</SelectItem>)}</SelectContent></Select>;
}
export default CommunityPatients;
