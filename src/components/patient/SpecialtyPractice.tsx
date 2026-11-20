import { useRef, useState } from "react";
import { Apple, Milk, ShoppingBasket, CalendarDays, CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { HomeExercise } from "@/data/homePractice";
export default function SpecialtyPractice({ exercise, onComplete }: { exercise: HomeExercise; onComplete: (note: string, minutes: number) => void }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const started = useRef(Date.now());
  const recall = exercise.kind === "recall";
  const calendar = exercise.kind === "calendar";
  const complete = step === 2;
  const date = new Date();
  const today = date.toLocaleDateString("zh-CN", {month:"long",day:"numeric",weekday:"long"});
  const options = recall ? ["苹果","钥匙","水杯","雨伞","帽子","手机"] : ["7 元","9 元","12 元"];
  const submit = () => {
    const correct = recall ? selected.length === 3 && ["苹果","钥匙","水杯"].every(x => selected.includes(x)) : selected[0] === "9 元";
    setFeedback(correct ? "完成了，做得很好！" : "再想一想，也可以返回看看。");
    if (correct) setStep(2);
  };
  return <div className="space-y-4"><h4 className="text-lg font-semibold">{exercise.name}</h4><Progress value={step * 50} />
    {complete ? <div className="py-6 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-success" /><p className="mt-3 font-semibold">本轮专项练习完成</p></div> : calendar ? <><CalendarDays className="mx-auto h-14 w-14 text-primary" /><p className="text-center text-lg font-semibold">{today}</p><p className="text-sm">核对今天的日期，并记录一件今天要做的事情。</p><label className="block text-sm">今天的待办<input aria-label="今天的待办" className="mt-2 h-12 w-full rounded-md border bg-background px-3 text-sm" value={selected[0] ?? ""} onChange={e => setSelected([e.target.value])} /></label><Button className="w-full" disabled={!selected[0]?.trim()} onClick={() => setStep(2)}>已核对日期并记录待办</Button></> : step === 0 ? <><div className="flex justify-center gap-5 rounded-lg bg-primary/5 p-5">{recall ? <><span className="text-lg">🍎 苹果</span><span className="text-lg">🔑 钥匙</span><span className="text-lg">🥛 水杯</span></> : <><span className="text-center"><Apple className="mx-auto h-10 w-10 text-success" />苹果<br />4 元</span><span className="text-center"><Milk className="mx-auto h-10 w-10 text-primary" />牛奶<br />5 元</span></>}</div><p className="text-sm text-muted-foreground">{recall ? "记住这三件物品，准备好后开始回忆。" : "买一份苹果和一盒牛奶，想想一共需要多少钱。"}</p><Button className="w-full" onClick={() => { setSelected([]); setStep(1); }}>{recall ? "开始回忆" : "去结算"}</Button></> : <><h5 className="text-base font-semibold">{recall ? "刚才出现了哪些物品？" : "需要支付多少？"}</h5><div className="grid grid-cols-2 gap-2">{options.map(option => <Button key={option} variant={selected.includes(option) ? "default" : "outline"} className="h-12" onClick={() => setSelected(old => recall ? old.includes(option) ? old.filter(x => x !== option) : [...old,option] : [option])}>{option}</Button>)}</div><p aria-live="polite" className="text-sm text-primary">{feedback}</p><div className="flex gap-2"><Button variant="outline" onClick={() => setStep(0)}><Eye className="mr-2 h-4 w-4" />再看一次</Button><Button className="flex-1" disabled={!selected.length} onClick={submit}><ShoppingBasket className="mr-2 h-4 w-4" />确认</Button></div></>}
    {complete && <Button className="w-full" onClick={() => onComplete(`${exercise.name}：${calendar ? `${today}，待办：${selected[0]}` : "完成本轮专项练习"}`, Math.max(1,Math.ceil((Date.now()-started.current)/60000)))}>记录本次练习</Button>}
  </div>;
}