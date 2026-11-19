import { useState } from "react";
import { CheckCircle2, Moon, Utensils, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import PatientActionSheet from "@/components/patient/PatientActionSheet";
import { useCurrentPatient } from "@/data/patients";
import { familyPlanTasks, familyPlanVersion, useFamilyCheckins, useSaveFamilyCheckin, type FamilyTask } from "@/data/familyTasks";
import { toast } from "@/hooks/use-toast";

export default function FamilyTasks({ compact = false }: { compact?: boolean }) {
  const { data: p, isLoading } = useCurrentPatient();
  const { data: checks = [], isLoading: loadingChecks } = useFamilyCheckins(p?.id);
  const save = useSaveFamilyCheckin();
  const [active, setActive] = useState<FamilyTask | null>(null);
  const [note, setNote] = useState("");
  const [minutes, setMinutes] = useState(20);
  const [by, setBy] = useState("本人");
  const [day, setDay] = useState(new Date().toLocaleDateString("sv-SE"));
  const tasks = familyPlanTasks(p);
  const version = p ? familyPlanVersion(p) : "";
  const done = (key: string) => checks.find(c => c.plan_version === version && c.task_key === key && c.recorded_on === day);
  const completed = tasks.filter(t => done(t.key)).length;
  const submit = async () => {
    if (!p || !active) return;
    if (!familyPlanTasks(p).some(t => t.key === active.key && t.title === active.title)) return toast({ title: "方案已更新，请重新选择任务" });
    try {
      await save.mutateAsync({ patient: p, task: active, date: day, minutes: active.category === "训练" ? minutes : undefined, note, by });
      setActive(null); toast({ title: "打卡已保存" });
    } catch (e) { toast({ title: "打卡失败", description: e instanceof Error ? e.message : String(e), variant: "destructive" }); }
  };
  if (isLoading || loadingChecks) return <p className="text-sm text-muted-foreground">读取任务…</p>;
  return <div className="space-y-3">
    {!compact && <div className="space-y-2 border-b pb-4"><label className="text-xs text-muted-foreground">执行日期<Input type="date" className="mt-1" value={day} onChange={e => setDay(e.target.value)} /></label><p className="text-sm">已打卡 {completed}/{tasks.length}</p><Progress value={tasks.length ? completed / tasks.length * 100 : 0} /></div>}
    {!tasks.length && <p className="py-5 text-sm text-muted-foreground">暂无可执行的家庭任务，等待医生确认含营养、睡眠或家庭训练的方案。</p>}
    {(["营养", "睡眠", "训练"] as const).map(category => {
      const group = tasks.filter(t => t.category === category);
      if (!group.length) return null;
      const Icon = category === "营养" ? Utensils : category === "睡眠" ? Moon : Brain;
      return <section key={category} className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-primary" />{category}任务</h3>
        {group.map(t => { const record = done(t.key); return <div key={t.key} className="rounded-lg border bg-card p-3">
          <div className="flex items-start gap-2"><div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{t.title}</p><p className="mt-1 text-xs text-muted-foreground">{[t.frequency, t.duration].filter(Boolean).join(" · ")}</p></div>
          <Button size="sm" variant={record ? "ghost" : "outline"} className="shrink-0 text-xs" onClick={() => { setActive(t); setNote(record?.note ?? ""); setMinutes(record?.duration_min ?? 20); setBy(record?.recorded_by ?? "本人"); }}>{record ? <><CheckCircle2 className="mr-1 h-3 w-3" />已打卡</> : "打卡"}</Button></div>
          {record && <p className="mt-2 text-xs text-muted-foreground">{record.recorded_on} · {record.recorded_by}{record.duration_min ? ` · ${record.duration_min} 分钟` : ""}{record.note ? ` · ${record.note}` : ""}</p>}
        </div>; })}
      </section>;
    })}
    <PatientActionSheet open={!!active} onOpenChange={o => !o && setActive(null)} title={active ? `${active.category}打卡` : "任务打卡"}>
      {active && <div className="space-y-3"><p className="text-sm font-medium">{active.title}</p><p className="text-xs text-muted-foreground">{active.frequency} · {active.duration}</p>
        <div className="flex gap-2">{["本人", "家属协助"].map(v => <Button key={v} size="sm" disabled={!!done(active.key)} variant={by === v ? "default" : "outline"} onClick={() => setBy(v)}>{v}</Button>)}</div>
        {active.category === "训练" && <div><p className="mb-2 text-sm">实际训练时长</p><div className="flex gap-2">{[20,30].map(v => <Button key={v} disabled={!!done(active.key)} variant={minutes === v ? "default" : "outline"} onClick={() => setMinutes(v)}>{v} 分钟</Button>)}</div></div>}
        <label className="block text-sm">备注<Textarea className="mt-1" value={note} readOnly={!!done(active.key)} maxLength={1000} onChange={e => setNote(e.target.value)} placeholder="记录执行情况或需要反馈的问题" /></label>
        {done(active.key) ? <p className="text-sm text-success">本日任务已打卡</p> : <Button className="w-full" disabled={save.isPending || !day} onClick={submit}>{save.isPending ? "保存中…" : "确认打卡"}</Button>}
      </div>}
    </PatientActionSheet>
  </div>;
}