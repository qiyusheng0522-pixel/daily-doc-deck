import { useState } from "react";
import { BookOpen, Send, Search, Play, Sparkles, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import ActionSheet from "@/components/nurse/ActionSheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useEducationItems, usePatients, usePushEducation } from "@/data/patients";

const todos = [
  { stage: "新建档", color: "bg-accent/10 text-accent border-accent/30", todos: [
    { title: "家庭血压监测 · 单人推送", patient: "张伟 · 小市社区", content: "《家庭血压监测要点》", due: "今日 16:00" },
  ] },
  { stage: "随访中", color: "bg-warning/10 text-warning border-warning/30", todos: [
    { title: "护脑饮食(MIND)指南 · 多人推送", patient: "认知训练小组 · 12 人", content: "《低盐低脂饮食建议》", due: "明日 10:00" },
  ] },
  { stage: "复诊期", color: "bg-success/10 text-success border-success/30", todos: [
    { title: "认知训练居家坚持 · 单人推送", patient: "刘秀英 · 小市社区", content: "《居家认知训练小贴士》", due: "明日 09:00" },
  ] },
];



const CommunityEducation = () => {
  const [tab, setTab] = useState<"todo" | "library">("todo");
  const { data: library = [] } = useEducationItems();
  const { data: patients = [] } = usePatients("community");
  const push = usePushEducation();
  const [target, setTarget] = useState<{ id: string; title: string } | null>(null);
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [picked, setPicked] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [lq, setLq] = useState("");
  const open = (c: { id: string; title: string }, m: "single" | "batch") => { setTarget(c); setMode(m); setPicked([]); setQ(""); };
  const toggle = (id: string) => setPicked((p) => mode === "single" ? [id] : p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const shown = patients.filter((p) => !q || p.name.includes(q));
  const confirm = () => {
    if (!target) return;
    push.mutate({ patientIds: picked, itemId: target.id }, {
      onSuccess: () => { toast({ title: mode === "single" ? "已推送" : `已批量推送 ${picked.length} 人`, description: target.title }); setTarget(null); },
      onError: (e) => toast({ title: "推送失败", description: (e as Error).message, variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-3 p-4">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {[{ k: "todo", label: "待办" }, { k: "library", label: "宣教库" }].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as any)}
            className={`rounded-md py-1.5 text-xs font-medium transition-all ${
              tab === t.k ? "bg-card shadow-soft" : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "todo" && (
        <>
          <Card className="bg-gradient-card p-3 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold">宣教待办</p>
                <p className="mt-0.5 text-[15.4px] text-muted-foreground">按随访阶段自动推送</p>
              </div>
              <Badge variant="destructive" className="h-5">{todos.length} 待办</Badge>
            </div>
          </Card>

          {todos.map((s) => (
            <Card key={s.stage} className="overflow-hidden">
              <div className={`flex items-center justify-between border-b px-4 py-2 ${s.color.split(" ").slice(0, 2).join(" ")}`}>
                <span className="text-xs font-semibold">{s.stage}</span>
                <Badge variant="outline" className="h-4 border-current text-[14px]">{s.todos.length} 项</Badge>
              </div>
              <div className="divide-y">
                {s.todos.map((t, i) => (
                  <div key={i} className="px-4 py-3">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="mt-0.5 truncate text-[15.4px] text-muted-foreground">{t.patient}</p>
                    <p className="mt-1 truncate text-[15.4px] text-foreground/70">📖 {t.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[14px] text-muted-foreground">截止 {t.due}</span>
                      <Button size="sm" className="h-7 bg-gradient-community text-xs" onClick={() => toast({ title: "已推送", description: t.title })}>
                        <Send className="mr-1 h-3 w-3" />立即推送
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </>
      )}

      {tab === "library" && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b bg-gradient-to-r from-accent/10 to-transparent px-4 py-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold">宣教库</h3>
            </div>
            <Badge className="h-5 bg-accent text-accent-foreground">社区版</Badge>
          </div>
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={lq} onChange={(e) => setLq(e.target.value)} placeholder="搜索宣教内容" className="h-8 pl-8 text-xs" />
            </div>
          </div>
          <div className="divide-y">
            {library.filter((c) => !lq || c.title.includes(lq)).map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Play className="h-3.5 w-3.5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{c.title}</p>
                  <p className="text-[15.4px] text-muted-foreground">{c.category} · {c.duration}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => open(c, "single")}>单人推送</Button>
                  <Button size="sm" className="h-7 bg-gradient-community text-xs" onClick={() => open(c, "batch")}>批量推送</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ActionSheet
        open={!!target}
        onOpenChange={(v) => !v && setTarget(null)}
        title="选择推送对象"
        description={target?.title}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setTarget(null)}>取消</Button>
            <Button className="bg-gradient-community" disabled={!picked.length || push.isPending} onClick={confirm}>
              <Send className="mr-1 h-4 w-4" />{mode === "single" ? "确认推送" : `推送给 ${picked.length} 人`}
            </Button>
          </div>
        }
      >
        <div className="space-y-2 py-2 text-xs">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {([["single", "单人推送"], ["batch", "批量多人"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => { setMode(k); setPicked([]); }} className={`rounded-md py-1.5 font-medium ${mode === k ? "bg-card shadow-soft" : "text-muted-foreground"}`}>{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索老人姓名" className="h-8 text-xs" />
            {mode === "batch" && (
              <Button size="sm" variant="outline" className="h-8 shrink-0 text-xs" onClick={() => setPicked(picked.length === shown.length ? [] : shown.map((p) => p.id))}>
                {picked.length === shown.length && shown.length ? "取消全选" : "全选"}
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">{mode === "single" ? "选择 1 位老人" : `已选 ${picked.length} / ${shown.length} 人`}</p>
          <div className="max-h-[360px] space-y-1.5 overflow-y-auto">
            {shown.map((p) => (
              <label key={p.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 ${picked.includes(p.id) ? "border-accent bg-accent/5" : ""}`}>
                <Checkbox checked={picked.includes(p.id)} onCheckedChange={() => toggle(p.id)} />
                <Users className="h-4 w-4 text-accent" />
                <span className="font-medium">{p.name}</span>
                <span className="ml-auto text-muted-foreground">{p.gender} · {p.age}岁</span>
              </label>
            ))}
          </div>
        </div>
      </ActionSheet>
    </div>
  );
};

export default CommunityEducation;
