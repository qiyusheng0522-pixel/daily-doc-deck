import { useState } from "react";
import { CheckCircle2, Moon, Utensils, Brain, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import PatientActionSheet from "@/components/patient/PatientActionSheet";
import { useCurrentPatient } from "@/data/patients";
import { familyPlanTasks, familyVisibleTasks, familyTaskLabel, prescribedBedtime, familyPlanVersion, useFamilyCheckins, useSaveFamilyCheckin, MEALS, mealTaskKey, type FamilyTask } from "@/data/familyTasks";
import { toast } from "@/hooks/use-toast";
import CognitivePractice from "@/components/patient/CognitivePractice";
import { practiceKind, dailyPractice, homeExercises, type HomeExercise } from "@/data/homePractice";

import SpecialtyPractice from "@/components/patient/SpecialtyPractice";
import { PatientTrainingHistory } from "@/components/cognitive/TrainingRecords";
import { patientTrainingCheckins } from "@/data/trainingSources";

type ActiveCheckin = { task: FamilyTask; mealIndex: number | null };

export default function FamilyTasks({ compact = false }: { compact?: boolean }) {
  const { data: p, isLoading } = useCurrentPatient();
  const { data: checks = [], isLoading: loadingChecks } = useFamilyCheckins(p?.id);
  const save = useSaveFamilyCheckin();
  const [active, setActive] = useState<ActiveCheckin | null>(null);
  const [practice, setPractice] = useState<FamilyTask | null>(null);
  const [exercise, setExercise] = useState<HomeExercise | null>(null);
  const [chooser, setChooser] = useState<FamilyTask | null>(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [note, setNote] = useState("");
  const [minutes, setMinutes] = useState(20);
  const [by, setBy] = useState("本人");
  const [sleepTime, setSleepTime] = useState("");
  const [day, setDay] = useState(new Date().toLocaleDateString("sv-SE"));
  const planTasks = familyPlanTasks(p);
  const tasks = familyVisibleTasks(planTasks);
  const bedtime = prescribedBedtime(planTasks);
  const version = p ? familyPlanVersion(p) : "";
  const done = (key: string) => checks.find(c => c.plan_version === version && c.task_key === key && c.recorded_on === day);
  const nutritionTask = tasks.find(t => t.category === "营养");
  const otherTasks = tasks.filter(t => t.category !== "营养");
  const mealRecords = nutritionTask ? MEALS.map((_, i) => done(mealTaskKey(nutritionTask, i))) : [];
  const completed = otherTasks.filter(t => done(t.key)).length + mealRecords.filter(Boolean).length;
  const total = otherTasks.length + (nutritionTask ? MEALS.length : 0);
  const slides: ActiveCheckin[] = [...otherTasks.map(task => ({ task, mealIndex: null })), ...(nutritionTask ? MEALS.map((_, mealIndex) => ({ task: nutritionTask, mealIndex })) : [])];
  const slide = slides[taskIndex % (slides.length || 1)];
  const slideKey = slide ? slide.mealIndex === null ? slide.task.key : mealTaskKey(slide.task, slide.mealIndex) : "";
  const slideRecord = done(slideKey);
  const slidePractice = slide ? dailyPractice(slide.task, day) : null;

  const openCheckin = (task: FamilyTask, mealIndex: number | null) => {
    const record = done(mealIndex === null ? task.key : mealTaskKey(task, mealIndex));
    setActive({ task, mealIndex });
    setSleepTime(""); setNote(record?.note ?? ""); setMinutes(record?.duration_min ?? 20); setBy(record?.recorded_by ?? "本人");
  };
  const submit = async () => {
    if (!p || !active) return;
    if (!familyPlanTasks(p).some(t => t.key === active.task.key && t.title === active.task.title)) return toast({ title: "方案已更新，请重新选择任务" });
    const meal = active.mealIndex === null ? null : MEALS[active.mealIndex];
    const task: FamilyTask = { ...active.task, key: meal && active.mealIndex !== null ? mealTaskKey(active.task, active.mealIndex) : active.task.key };
    const mealNote = meal ? `${meal.name}：${note || "已用餐"}` : active.task.category === "睡眠" && sleepTime ? `入睡时间 ${sleepTime}${note ? ` · ${note}` : ""}` : note;
    try {
      await save.mutateAsync({ patient: p, task, date: day, minutes: active.task.category === "训练" ? minutes : undefined, note: mealNote, by });
      setActive(null); toast({ title: "打卡已保存" });
    } catch (e) { toast({ title: "打卡失败", description: e instanceof Error ? e.message : String(e), variant: "destructive" }); }
  };
  if (isLoading || loadingChecks) return <p className="text-sm text-muted-foreground">读取任务…</p>;
  return <div className="space-y-3">
    {compact && <div className="space-y-3">
      <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /><h2 className="flex-1 text-lg font-semibold">今日任务</h2><span className="text-xs text-primary">{completed}/{total}</span><Button variant="ghost" size="icon" className="h-8 w-8" aria-label="上一个任务" disabled={slides.length < 2} onClick={() => setTaskIndex(i => (i+slides.length-1)%slides.length)}><ChevronLeft className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" aria-label="下一个任务" disabled={slides.length < 2} onClick={() => setTaskIndex(i => (i+1)%slides.length)}><ChevronRight className="h-4 w-4" /></Button></div>
      {slide && <div className="space-y-3 border-t pt-3"><div className="flex items-start gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">{slide.task.category === "训练" ? <Brain className="h-6 w-6" /> : slide.task.category === "睡眠" ? <Moon className="h-6 w-6" /> : <Utensils className="h-6 w-6" />}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{slide.mealIndex !== null ? MEALS[slide.mealIndex].name : slide.task.category === "训练" ? "认知训练" : "睡眠打卡"}</p><p className="mt-1 text-xs text-primary">{slide.mealIndex !== null ? MEALS[slide.mealIndex].time : slide.task.frequency}</p></div><span className={`shrink-0 rounded px-2 py-1 text-[15.4px] ${slideRecord ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{slideRecord ? "已完成" : "待完成"}</span></div><p className="line-clamp-2 text-xs text-muted-foreground">{slideRecord?.note && slide.task.category === "训练" ? slideRecord.note.split("，")[0] : slidePractice?.name ?? familyTaskLabel(slide.task)}</p><div className="flex gap-2">{!slideRecord && homeExercises(slide.task).length > 0 && <Button className="flex-1" onClick={() => setChooser(slide.task)}>开始练习</Button>}<Button className="flex-1" variant={practiceKind(slide.task) && !slideRecord ? "outline" : "default"} onClick={() => openCheckin(slide.task,slide.mealIndex)}>{slideRecord ? "查看打卡" : "去打卡"}</Button></div></div>}
    </div>}
    {!compact && <div className="space-y-2 border-b pb-4"><label className="text-xs text-muted-foreground">执行日期<Input type="date" className="mt-1" value={day} onChange={e => setDay(e.target.value)} /></label><p className="text-sm">已打卡 {completed}/{total}</p><Progress value={total ? completed / total * 100 : 0} /></div>}
    {!tasks.length && <p className="py-5 text-sm text-muted-foreground">暂无可执行的家庭任务，等待医生确认含营养、睡眠或家庭训练的方案。</p>}
    {!compact && nutritionTask && <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><Utensils className="h-4 w-4 text-primary" />饮食打卡</h3>
      {MEALS.map((meal, i) => { const record = mealRecords[i]; return <div key={meal.name} className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10"><Utensils className="h-5 w-5 text-primary" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{meal.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-primary"><Clock className="h-3 w-3" />{meal.time}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{record?.note && record.note !== `${meal.name}：已用餐` ? record.note.replace(/^.*：/, "") : "记录菜品 / 用餐情况"}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[15.4px] ${record ? "bg-success/10 text-success" : "bg-warning/15 text-warning"}`}>{record ? "已完成" : "待完成"}</span>
          <Button size="sm" variant={record ? "ghost" : "default"} className="h-7 rounded-full px-3 text-xs" onClick={() => openCheckin(nutritionTask, i)}>{record ? "查看" : "确认"}</Button>
        </div>
      </div>; })}
    </section>}
    {!compact && (["睡眠", "训练"] as const).map(category => {
      const group = otherTasks.filter(t => t.category === category);
      if (!group.length) return null;
      const Icon = category === "睡眠" ? Moon : Brain;
      return <section key={category} className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-primary" />{category === "睡眠" ? "睡眠" : "训练任务"}</h3>
        {group.map(t => { const record = done(t.key); return <div key={t.key} className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2"><div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{dailyPractice(t, day)?.name ?? familyTaskLabel(t)}</p>{t.category === "睡眠" && <p className="mt-1 text-xs text-muted-foreground">{bedtime ? `${bedtime} 入睡` : "记录今晚入睡时间"}</p>}</div>
          <Button size="sm" variant={record ? "ghost" : "outline"} className="shrink-0 text-xs" onClick={() => openCheckin(t, null)}>{record ? <><CheckCircle2 className="mr-1 h-3 w-3" />已打卡</> : "打卡"}</Button></div>
          {t.category === "训练" && <><p className="mt-2 text-xs text-muted-foreground">{t.frequency} · {t.duration}</p>{homeExercises(t).length > 0 && <Button className="mt-3 w-full" variant="secondary" onClick={() => setChooser(t)}>选择游戏 / 专项训练</Button>}</>}
          {record && <p className="mt-2 text-xs text-muted-foreground">打卡时间 {new Date(record.created_at).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}{record.duration_min ? ` · ${record.duration_min} 分钟` : ""}{record.note ? ` · ${record.note}` : ""}</p>}
        </div>; })}
      </section>;
    })}
    {!compact && <PatientTrainingHistory records={patientTrainingCheckins(checks)} compact />}
    <PatientActionSheet open={!!chooser} onOpenChange={o => !o && setChooser(null)} title="游戏与专项训练">
      {chooser && <div className="grid grid-cols-2 gap-3">{homeExercises(chooser).map(item => <Button key={item.id} variant="outline" className="h-auto min-h-28 flex-col items-start gap-2 whitespace-normal p-3 text-left" onClick={() => { setPractice(chooser); setExercise(item); setChooser(null); }}><Brain className="h-7 w-7 text-primary" /><span className="text-sm font-semibold">{item.name}</span><span className="text-xs text-muted-foreground">{item.domain}</span></Button>)}</div>}
    </PatientActionSheet>
    <PatientActionSheet open={!!practice} onOpenChange={o => !o && setPractice(null)} title="认知练习">
      {practice && exercise && (exercise.kind === "memory" || exercise.kind === "attention" ? <CognitivePractice key={exercise.id} kind={exercise.kind} variant={exercise.variant} name={exercise.name} onComplete={(result, elapsed) => { openCheckin(practice, null); setMinutes(elapsed); setNote(result); setPractice(null); }} /> : <SpecialtyPractice key={exercise.id} exercise={exercise} onComplete={(result, elapsed) => { openCheckin(practice, null); setMinutes(elapsed); setNote(result); setPractice(null); }} />)}
    </PatientActionSheet>
    <PatientActionSheet open={!!active} onOpenChange={o => !o && setActive(null)} title={active && active.mealIndex !== null ? `${MEALS[active.mealIndex].name}打卡` : active?.task.category === "训练" ? "认知训练打卡" : active ? familyTaskLabel(active.task) : "任务打卡"}>
      {active && <div className="space-y-3">
        {active.mealIndex !== null ? <p className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" />{MEALS[active.mealIndex].time} · {familyTaskLabel(active.task)}</p> : <><p className="text-sm font-medium">{familyTaskLabel(active.task)}</p>{active.task.category === "训练" && <p className="text-sm text-muted-foreground">{active.task.title}</p>}</>}
        <div className="flex gap-2">{["本人", "家属协助"].map(v => <Button key={v} size="sm" disabled={!!done(active.mealIndex === null ? active.task.key : mealTaskKey(active.task, active.mealIndex))} variant={by === v ? "default" : "outline"} onClick={() => setBy(v)}>{v}</Button>)}</div>
        {active.task.category === "训练" && <label className="block text-sm">实际训练时长（分钟）<Input className="mt-2" type="number" min={1} max={240} value={minutes} disabled={!!done(active.task.key)} onChange={e => setMinutes(Number(e.target.value))} /></label>}
        {active.task.category === "睡眠" && !done(active.task.key) && <label className="block text-sm">入睡时间<Input type="time" className="mt-1" value={sleepTime} onChange={e => setSleepTime(e.target.value)} /></label>}
        {done(active.mealIndex === null ? active.task.key : mealTaskKey(active.task, active.mealIndex)) && <p className="text-xs text-muted-foreground">打卡时间：{new Date(done(active.mealIndex === null ? active.task.key : mealTaskKey(active.task, active.mealIndex))?.created_at ?? "").toLocaleString("zh-CN")}</p>}
        <label className="block text-sm">{active.mealIndex !== null ? "菜品 / 用餐情况" : "备注"}<Textarea className="mt-1" value={note} readOnly={!!done(active.mealIndex === null ? active.task.key : mealTaskKey(active.task, active.mealIndex))} maxLength={1000} onChange={e => setNote(e.target.value)} placeholder={active.mealIndex !== null ? "记录吃了什么、食量如何" : "记录执行情况或需要反馈的问题"} /></label>
        {done(active.mealIndex === null ? active.task.key : mealTaskKey(active.task, active.mealIndex)) ? <p className="text-sm text-success">已完成打卡</p> : <Button className="w-full" disabled={save.isPending || !day || (active.task.category === "训练" && (!Number.isInteger(minutes) || minutes < 1 || minutes > 240))} onClick={submit}>{save.isPending ? "保存中…" : "确认打卡"}</Button>}
      </div>}
    </PatientActionSheet>
  </div>;
}
