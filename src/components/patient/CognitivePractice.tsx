import { useEffect, useRef, useState } from "react";
import { Apple, Cherry, Flower2, Fish, Leaf, Star, HelpCircle, RotateCcw, CheckCircle2, Banana, Grape, Citrus, Shell, Bird, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { PracticeKind } from "@/data/homePractice";
const pictureSets = [[Apple, Cherry, Banana, Grape, Citrus, Star], [Flower2, Fish, Leaf, Shell, Bird, TreePine]];
function shuffled<T>(items: T[]): T[] { return items.map(value => ({ value, order: Math.random() })).sort((a,b) => a.order-b.order).map(x => x.value); }
export default function CognitivePractice({ kind, variant = 0, name, onComplete }: { kind: PracticeKind; variant?: number; name?: string; onComplete: (note: string, minutes: number) => void }) {
  const pictures = pictureSets[variant % 2];
  const reverse = kind === "attention" && variant % 2 === 1;
  const title = name ?? (kind === "memory" ? "记忆配对" : reverse ? "数字倒序" : "数字顺序");
  const [cards, setCards] = useState(() => shuffled([...pictures.keys(), ...pictures.keys()]));
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [numbers, setNumbers] = useState(() => shuffled([1,2,3,4,5,6,7,8,9]));
  const [next, setNext] = useState(1);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const started = useRef(Date.now());
  const complete = kind === "memory" ? matched.length === cards.length : next === 10;
  const expected = reverse ? 10-next : next;
  useEffect(() => {
    if (selected.length !== 2) return;
    const [a,b] = selected;
    const match = cards[a] === cards[b];
    setFeedback(match ? "找到一对了！" : "再看看，记住它们的位置");
    const timer = setTimeout(() => { if (match) setMatched(old => [...old,a,b]); setSelected([]); }, match ? 350 : 1100);
    return () => clearTimeout(timer);
  }, [selected, cards]);
  const reset = () => { setCards(shuffled([...pictures.keys(), ...pictures.keys()])); setNumbers(shuffled([1,2,3,4,5,6,7,8,9])); setSelected([]); setMatched([]); setNext(1); setAttempts(0); setFeedback(""); started.current = Date.now(); };
  return <div className="space-y-4">
    <div className="flex items-center justify-between"><h3 className="text-base font-semibold">{title}</h3><Button variant="ghost" size="icon" aria-label="重新开始" title="重新开始" onClick={reset}><RotateCcw className="h-4 w-4" /></Button></div>
    <p className="text-sm text-muted-foreground">{kind === "memory" ? "翻开两张图，找到相同的图案。" : reverse ? "从 9 到 1，依次点选数字。" : "从 1 到 9，依次点选数字。"}</p>
    <Progress value={kind === "memory" ? matched.length/cards.length*100 : (next-1)/9*100} />
    <div className={`grid gap-2 ${kind === "memory" ? "grid-cols-4" : "grid-cols-3"}`}>
      {kind === "memory" ? cards.map((value,i) => { const visible = selected.includes(i) || matched.includes(i); const Icon = pictures[value]; return <Button key={i} aria-label={visible ? `图案${value+1} 位置${i+1}` : `翻开第${i+1}张`} variant={matched.includes(i) ? "secondary" : visible ? "outline" : "default"} className="h-auto aspect-square w-full p-2" disabled={matched.includes(i) || selected.includes(i) || selected.length === 2} onClick={() => { setSelected(old => [...old,i]); setAttempts(old => old+1); }}>{visible ? <Icon className="h-8 w-8" /> : <HelpCircle className="h-7 w-7" />}</Button>; }) : numbers.map(n => <Button key={n} aria-label={`数字${n}`} variant={(reverse ? n > expected : n < expected) ? "secondary" : "outline"} disabled={(reverse ? n > expected : n < expected)} className="h-auto aspect-square text-2xl" onClick={() => { setAttempts(old => old+1); if (n === expected) { setNext(next+1); setFeedback("很好，继续！"); } else setFeedback("不着急，找找下一个数字"); }}>{(reverse ? n > expected : n < expected) ? <CheckCircle2 className="h-7 w-7 text-success" /> : n}</Button>)}
    </div>
    <p className="min-h-6 text-sm text-primary" aria-live="polite">{complete ? "本轮练习完成，辛苦了！" : feedback || "准备好了就开始吧"}</p>
    {complete && <Button className="w-full" onClick={() => onComplete(`${title}：${kind === "memory" ? "完成6对图案" : reverse ? "完成9–1排序" : "完成1–9排序"}，操作${attempts}次`, Math.max(1, Math.ceil((Date.now()-started.current)/60000)))}>记录本次练习</Button>}
  </div>;
}
