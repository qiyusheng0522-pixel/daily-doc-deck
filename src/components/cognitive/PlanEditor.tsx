import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Advice } from "./AiAdvicePanel";

export default function PlanEditor({ value, onChange }: { value: Advice; onChange: (plan: Advice) => void }) {
  const lines = (s: string) => s.split("\n").filter(x => x.trim());
  return <div className="space-y-4">
    <label className="block text-xs">方案概述<Textarea className="mt-1" aria-label="方案概述" value={value.summary} onChange={e => onChange({ ...value, summary: e.target.value })} /></label>
    <label className="block text-xs">治疗重点（每行一项）<Textarea className="mt-1" value={value.focus.join("\n")} onChange={e => onChange({ ...value, focus: lines(e.target.value) })} /></label>
    {value.interventions?.map((item, i) => <section key={i} className="space-y-2 border-b pb-3">
      <h4 className="text-sm font-semibold">治疗类型 {i + 1}</h4>
      <Input aria-label={`治疗类型${i + 1}`} value={item.category} onChange={e => onChange({ ...value, interventions: value.interventions?.map((t, j) => j === i ? { ...t, category: e.target.value } : t) })} />
      <Textarea aria-label={`${item.category}具体措施`} rows={4} value={item.actions.join("\n")} onChange={e => onChange({ ...value, interventions: value.interventions?.map((t, j) => j === i ? { ...t, actions: lines(e.target.value) } : t) })} />
      <div className="grid grid-cols-2 gap-2">{(["frequency", "duration"] as const).map(k => <label key={k} className="text-xs">{k === "frequency" ? "频次" : "时长"}<Input value={item[k]} onChange={e => onChange({ ...value, interventions: value.interventions?.map((t, j) => j === i ? { ...t, [k]: e.target.value } : t) })} /></label>)}</div>
    </section>)}
    <h4 className="text-sm font-semibold">具体认知训练</h4>
    {value.training.map((item, i) => <section key={i} className="space-y-2 border-b pb-3">
      <div className="flex items-center justify-between"><span className="text-xs font-medium">训练 {i + 1}</span><Button size="sm" variant="ghost" disabled={value.training.length === 1} onClick={() => onChange({ ...value, training: value.training.filter((_, j) => i !== j) })}>删除</Button></div>
      <div className="grid grid-cols-2 gap-2"><label className="text-xs">训练领域<select className="mt-1 h-10 w-full rounded-md border bg-background px-2" value={item.domain} onChange={e => onChange({ ...value, training: value.training.map((t, j) => j === i ? { ...t, domain: e.target.value } : t) })}>{["记忆", "注意力", "执行功能", "定向力", "视空间", "语言", "计算", "逻辑与问题解决"].map(x => <option key={x}>{x}</option>)}</select></label>
      <label className="text-xs">执行场景<select className="mt-1 h-10 w-full rounded-md border bg-background px-2" value={item.setting} onChange={e => onChange({ ...value, training: value.training.map((t, j) => j === i ? { ...t, setting: e.target.value } : t) })}>{["站内小组", "站内个训", "家庭作业", "家庭病床", "上门康复"].map(x => <option key={x}>{x}</option>)}</select></label></div>
      <label className="block text-xs">训练内容、材料与步骤<Textarea aria-label={`训练${i + 1}具体内容`} className="mt-1" rows={5} value={item.activity} onChange={e => onChange({ ...value, training: value.training.map((t, j) => j === i ? { ...t, activity: e.target.value } : t) })} /></label>
      <div className="grid grid-cols-2 gap-2">{(["frequency", "duration"] as const).map(k => <label key={k} className="text-xs">{k === "frequency" ? "频次" : "时长"}<Input value={item[k]} onChange={e => onChange({ ...value, training: value.training.map((t, j) => j === i ? { ...t, [k]: e.target.value } : t) })} /></label>)}</div>
    </section>)}
    <Button size="sm" variant="outline" onClick={() => onChange({ ...value, training: [...value.training, { domain: "记忆", setting: "站内小组", activity: "", frequency: "", duration: "" }] })}>添加训练项目</Button>
    <h4 className="text-sm font-semibold">随访与照护</h4>
    {(["cycle", "reassess"] as const).map(k => <label key={k} className="block text-xs">{k === "cycle" ? "随访周期" : "复评周期"}<Input value={value.followup[k]} onChange={e => onChange({ ...value, followup: { ...value.followup, [k]: e.target.value } })} /></label>)}
    <label className="block text-xs">随访事项（每行一项）<Textarea value={value.followup.items.join("\n")} onChange={e => onChange({ ...value, followup: { ...value.followup, items: lines(e.target.value) } })} /></label>
    {(["caregiver_tips", "red_flags"] as const).map(k => <label key={k} className="block text-xs">{k === "caregiver_tips" ? "照护要点" : "警示事项"}（每行一项）<Textarea value={value[k].join("\n")} onChange={e => onChange({ ...value, [k]: lines(e.target.value) })} /></label>)}
  </div>;
}