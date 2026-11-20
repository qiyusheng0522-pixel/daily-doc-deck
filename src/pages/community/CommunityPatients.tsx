import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Plus, SlidersHorizontal, RotateCcw, ClipboardCheck, Dumbbell, ArrowRight } from "lucide-react";
import NewPatientScreening from "@/components/community/NewPatientScreening";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useReceiveReferral } from "@/data/patients";
import { filterCommunityPatients, pendingCommunityReferral, communityScreeningAbnormal } from "@/data/communityReception";
import type { DoctorPatientFilters } from "@/data/doctorReception";
import { upwardReferralState } from "@/data/referralApproval";
import { useCommunityWork } from "@/data/useCommunityWork";
import { matchesCommunityCategory, matchesScreeningFilter, screeningPresentation, type ScreeningFilter } from "@/data/communityPatientPresentation";

const CommunityPatients = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [more, setMore] = useState(false);
  const [result, setResult] = useState<ScreeningFilter>("全部");
  const [filters, setFilters] = useState<Omit<DoctorPatientFilters, "query" | "reception">>({ risk: "全部", source: "全部", gender: "全部" });
  const work = useCommunityWork();
  const receive = useReceiveReferral();
  const workMode = params.get("work");
  const riskOnly = params.get("tab") === "risk" || params.get("tab") === "abnormal";
  const category = riskOnly ? "risk" : params.get("tab") === "screen" ? "screen" : "all";
  const reception = params.get("reception") ?? (params.get("tab") === "new" ? "待接收" : params.get("tab") === "managed" ? "在管患者" : "全部患者");
  const assessmentIds = new Set(work.assessment.map(p => p.id));
  const trainingIds = new Set(work.training.map(p => p.id));
  const list = filterCommunityPatients(work.community, work.referrals, { ...filters, query, reception: "全部患者", riskOnly })
    .filter(p => reception === "全部患者" || (reception === "待接收" ? !!pendingCommunityReferral(work.referrals, p.id) : !pendingCommunityReferral(work.referrals, p.id)))
    .filter(p => matchesCommunityCategory(p, category))
    .filter(p => matchesScreeningFilter(p, result))
    .filter(p => !workMode || (workMode === "assessment" ? assessmentIds : trainingIds).has(p.id));
  const clearFilters = () => { setQuery(""); setResult("全部"); setFilters({ risk: "全部", source: "全部", gender: "全部" }); const next = new URLSearchParams(params); next.delete("reception"); if (next.get("tab") === "new" || next.get("tab") === "managed") next.delete("tab"); setParams(next); };
  const extras = Number(filters.source !== "全部") + Number(filters.gender !== "全部") + Number(reception !== "全部患者");
  const changeCategory = (value: string) => { setParams(value === "all" ? {} : { tab: value }); setResult("全部"); setFilters(f => ({ ...f, risk: "全部" })); };
  return <div className="space-y-4 px-6 py-3">
    <header className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">患者档案 <span className="ml-2 text-sm font-normal text-muted-foreground">{work.community.length} 位</span></h2><Button className="bg-gradient-community" onClick={() => setAdding(true)}><Plus className="mr-1 h-4 w-4" />新增患者</Button></header>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
      <Tabs value={category} onValueChange={changeCategory}><TabsList className="h-auto"><TabsTrigger value="all">全部</TabsTrigger><TabsTrigger value="screen">初筛</TabsTrigger><TabsTrigger value="risk">风险患者 <span className="ml-2 text-xs text-muted-foreground">{work.community.filter(communityScreeningAbnormal).length}</span></TabsTrigger></TabsList></Tabs>
      <div className="flex flex-wrap gap-2">{[{ key: "assessment", label: "待评估", n: work.assessment.length, icon: ClipboardCheck }, { key: "training", label: "今日训练", n: work.training.length, icon: Dumbbell }].map(t => <Button key={t.key} size="sm" variant={workMode === t.key ? "secondary" : "ghost"} className="text-xs" onClick={() => { setResult("全部"); setFilters({ risk: "全部", source: "全部", gender: "全部" }); setParams(workMode === t.key ? {} : { work: t.key }); }}><t.icon className="mr-1 h-4 w-4" />{t.label} {t.n}</Button>)}</div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[160px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="搜索患者姓名" value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索患者姓名" className="bg-card pl-9 text-xs" /></div>
      <div className="w-36"><FilterSelect label="评估结果" value={result} options={["全部", "待评估", "阴性", "阳性"]} allLabel="全部结果" onChange={v => setResult(v as ScreeningFilter)} /></div>
      {riskOnly && <div className="w-36"><FilterSelect label="风险等级" value={filters.risk} options={["全部", "低风险", "中风险", "高风险"]} allLabel="全部风险" onChange={v => setFilters(f => ({ ...f, risk: v }))} /></div>}
      <Button size="sm" variant={more || extras ? "secondary" : "outline"} className="text-xs" aria-expanded={more} onClick={() => setMore(!more)}><SlidersHorizontal className="mr-1 h-4 w-4" />更多筛选{extras ? ` · ${extras}` : ""}</Button>
      <Button size="icon" variant="ghost" title="重置筛选" aria-label="重置筛选" onClick={clearFilters}><RotateCcw className="h-4 w-4" /></Button>
    </div>
    {more && <div className="grid grid-cols-1 gap-3 border-b pb-4 sm:grid-cols-3">{[{ label: "来源渠道", value: filters.source, options: ["全部", "南京市鼓楼医院", "小市社区"], allLabel: "全部来源", change: (v: string) => setFilters(f => ({ ...f, source: v })) }, { label: "性别", value: filters.gender, options: ["全部", "男", "女"], allLabel: "全部性别", change: (v: string) => setFilters(f => ({ ...f, gender: v })) }, { label: "接收情况", value: reception, options: ["全部患者", "在管患者", "待接收"], allLabel: "全部患者", change: (v: string) => { const next = new URLSearchParams(params); next.set("reception", v); setParams(next); } }].map(f => <div key={f.label} className="space-y-1"><p className="text-xs text-muted-foreground">{f.label}</p><FilterSelect label={f.label} value={f.value} options={f.options} allLabel={f.allLabel} onChange={f.change} /></div>)}</div>}
    <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{workMode === "assessment" ? "待评估" : workMode === "training" ? "今日待训练" : reception === "待接收" ? "待接收" : riskOnly ? "风险患者" : category === "screen" ? "初筛名单" : "全部患者"} · 共 {list.length} 位</span>{workMode && <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setParams({})}>返回全部名单</Button>}</div>
    <div className="overflow-x-auto bg-card">
      <div role="table" aria-label="社区患者名单" className="min-w-[730px]">
        <div role="row" className="grid grid-cols-[1.1fr_1fr_.8fr_1fr_106px] gap-3 border-y bg-muted/50 px-3 py-3 text-xs font-medium text-muted-foreground">{["姓名 / 年龄性别", "来源", "初筛结果", "评估风险", "下一步操作"].map(h => <div key={h} role="columnheader">{h}</div>)}</div>
        {work.isLoading && <p className="p-8 text-center text-sm text-muted-foreground">加载中…</p>}
        {!work.isLoading && !list.length && <p className="p-8 text-center text-sm text-muted-foreground">无匹配患者</p>}
        {!work.isLoading && list.map(p => {
          const pending = pendingCommunityReferral(work.referrals, p.id);
          const transfer = upwardReferralState(work.referrals, p.id);
          const display = screeningPresentation(p);
          const assessing = assessmentIds.has(p.id);
          const training = trainingIds.has(p.id);
          const detail = `/community/patients/${p.id}`;
          const label = pending ? "去接收" : assessing ? "去评估" : training ? "去训练" : !display.positive ? "宣教" : !p.cognitive_risk ? "查看评估" : p.cognitive_risk === "低风险" ? "随访" : "查看方案";
          const to = assessing ? `${detail}?tab=scale&action=ad8` : training ? `${detail}?tab=training` : !display.positive ? `/community/education?patient=${p.id}` : !p.cognitive_risk ? `${detail}?tab=scale` : p.cognitive_risk === "低风险" ? `/community/followup?patient=${p.id}` : `${detail}?tab=plan`;
          return <div key={p.id} role="row" className="grid grid-cols-[1.1fr_1fr_.8fr_1fr_106px] items-center gap-3 border-b px-3 py-4 transition-colors hover:bg-muted/30">
            <div role="cell" className="min-w-0"><Link to={detail} className="font-semibold text-foreground hover:text-primary">{p.name}</Link><p className="mt-1 text-xs text-muted-foreground">{p.gender} · {p.age}岁</p>{transfer && <p className="mt-1 text-xs text-primary">转诊：{transfer}</p>}</div>
            <div role="cell" className="text-xs text-muted-foreground">{p.source}</div>
            <div role="cell"><span className={`text-xs font-medium ${display.result === "待评估" ? "text-muted-foreground" : display.positive ? "text-warning" : "text-success"}`}>{display.result}</span>{p.ad8 != null && <p className="mt-1 text-xs text-muted-foreground">AD-8 {p.ad8} 分</p>}</div>
            <div role="cell" className={`text-xs ${display.risk === "高风险" ? "text-destructive" : display.risk === "中风险" ? "text-warning" : display.risk === "低风险" ? "text-success" : "text-muted-foreground"}`}>{display.risk}</div>
            <div role="cell">{pending ? <Button size="sm" variant="outline" className="w-full text-xs text-accent" disabled={receive.isPending} onClick={() => receive.mutate({ referralId: pending.id, patientId: p.id }, { onSuccess: () => toast({ title: "患者已加入社区患者列表" }), onError: e => toast({ title: "接收失败", description: e.message, variant: "destructive" }) })}>{label}</Button> : <Button asChild size="sm" variant="outline" className="w-full text-xs text-accent"><Link to={to}>{label}<ArrowRight className="ml-1 h-3 w-3" /></Link></Button>}</div>
          </div>;
        })}
      </div>
    </div>
    <NewPatientScreening open={adding} onClose={() => setAdding(false)} />
  </div>;
};
function FilterSelect({ label, value, options, allLabel, onChange }: { label: string; value: string; options: string[]; allLabel?: string; onChange: (value: string) => void }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className="min-w-0 bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o === "全部" ? allLabel : o}</SelectItem>)}</SelectContent></Select>;
}
export default CommunityPatients;
