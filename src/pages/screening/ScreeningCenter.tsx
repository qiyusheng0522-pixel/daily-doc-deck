import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, CheckCircle2, ClipboardList, RefreshCw, Send, Stethoscope, Signal, Wifi, BatteryFull } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RoleSwitcher from "@/components/RoleSwitcher";
import { toast } from "@/hooks/use-toast";
import { ad8Positive } from "@/data/cognitive";
import type { Tables } from "@/integrations/supabase/types";

type Row = Tables<"screenings">;
const STATUSES = ["全部", "待核对", "已核对", "已沟通", "已预约"] as const;
const TARGETS = ["小市社区认知训练站"];
const OPERATOR = "体检中心 王筛查";

function useScreenings() {
  return useQuery({
    queryKey: ["screenings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("screenings").select("*").order("exam_date", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
  });
}

const tone: Record<string, string> = {
  待核对: "bg-warning/15 text-warning", 已核对: "bg-primary/10 text-primary",
  已沟通: "bg-accent/15 text-accent", 已预约: "bg-success/15 text-success",
};

export default function ScreeningCenter() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading, error } = useScreenings();
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("全部");
  const [act, setAct] = useState<null | { kind: "verify" | "refer" | "book"; row: Row }>(null);
  const [ad8, setAd8] = useState("");
  const [target, setTarget] = useState(TARGETS[0]);
  const [when, setWhen] = useState("");
  const [note, setNote] = useState("");

  const save = useMutation({
    mutationFn: async (patch: Partial<Row> & { id: string }) => {
      const { id, ...rest } = patch;
      if (rest.status === "已预约") {
        const row = rows.find((r) => r.id === id)!;
        const visit = `体检预约 ${new Date(rest.appointment_at!).toLocaleDateString("zh-CN")}`;
        if (row.patient_id) {
          const { error: e1 } = await supabase.from("patients").update({ community_stage: "干预中", last_visit: visit }).eq("id", row.patient_id);
          if (e1) throw e1;
        } else {
          const { data: p, error: e1 } = await supabase.from("patients").insert({
            name: row.name, gender: row.gender, age: row.age, phone: row.phone, ad8: row.ad8,
            diagnosis: "体检初筛 AD-8 异常，待训练站评估", source: "小市社区", status: "候诊中",
            community_stage: "干预中", last_visit: visit, cognitive_risk: "中",
          }).select("id").single();
          if (e1) throw e1;
          rest.patient_id = p.id;
        }
      }
      const { error } = await supabase.from("screenings").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["screenings"] }); qc.invalidateQueries({ queryKey: ["patients"] }); setAct(null); },
    onError: (e) => toast({ title: "保存失败", description: String(e) }),
  });

  const open = (kind: "verify" | "refer" | "book", row: Row) => {
    setAct({ kind, row }); setAd8(String(row.ad8)); setTarget(row.refer_to ?? (ad8Positive(row.ad8) ? TARGETS[0] : TARGETS[0]));
    setWhen(""); setNote(row.note ?? "");
  };

  const submit = () => {
    if (!act) return;
    const { row, kind } = act;
    if (kind === "verify") {
      const n = Number(ad8);
      if (!Number.isInteger(n) || n < 0 || n > 8) return toast({ title: "AD-8 分数应为 0-8 的整数" });
      save.mutate({ id: row.id, ad8: n, status: "已核对", verified_by: OPERATOR, note: note || null },
        { onSuccess: () => toast({ title: "初筛结果已核对", description: ad8Positive(n) ? "AD-8 ≥2 分为阳性，请登记转介" : "阴性：纳入宣教与年度复查" }) });
    } else if (kind === "refer") {
      save.mutate({ id: row.id, status: "已沟通", refer_to: target, note: note || null },
        { onSuccess: () => toast({ title: "已电话沟通", description: `老人同意前往${target}，请登记预约` }) });
    } else {
      if (!when) return toast({ title: "请选择预约时间" });
      save.mutate({ id: row.id, status: "已预约", appointment_at: new Date(when).toISOString(), note: note || null },
        { onSuccess: () => toast({ title: "预约已登记", description: `${row.refer_to} · ${new Date(when).toLocaleString("zh-CN")}` }) });
    }
  };

  const list = rows.filter((r) => filter === "全部" || r.status === filter);
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const positive = rows.filter((r) => ad8Positive(r.ad8)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 px-4 py-6 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <RoleSwitcher />
      <div className="mx-auto" style={{ width: 408 }}>
        <div className="phone-shell">
          <span className="phone-side-left" />
          <div className="phone-screen relative flex flex-col" style={{ height: 820 }}>
            <div className="phone-notch" />
            <div className="phone-statusbar"><span>9:41</span><span className="flex items-center gap-1.5 text-foreground/80"><Signal className="h-3.5 w-3.5" /><Wifi className="h-3.5 w-3.5" /><BatteryFull className="h-3.5 w-3.5" /></span></div>
            <header className="flex items-center gap-2 border-b bg-card px-4 py-3">
              <Link to="/" aria-label="返回首页" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground"><Stethoscope className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1"><h1 className="text-base font-semibold">体检中心筛查端</h1><p className="text-[15.4px] text-muted-foreground">筛出异常 · 电话沟通 · 预约到训练站</p></div>
              <Button variant="ghost" size="icon" disabled title="体检系统接口尚未接入" aria-label="从体检系统同步（未接入）"><RefreshCw className="h-4 w-4" /></Button>
            </header>
            <main className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-3">
              <div className="grid grid-cols-3 gap-2">
                {[["初筛总数", rows.length], ["AD-8阳性", positive], ["待核对", count("待核对")]].map(([k, v]) => (
                  <Card key={k as string} className="p-2.5 text-center"><p className="text-[15.4px] text-muted-foreground">{k}</p><p className="text-xl font-bold">{v}</p></Card>
                ))}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {STATUSES.map((s) => (
                  <button key={s} onClick={() => setFilter(s)} className={`shrink-0 rounded-full border px-3 py-1 text-xs ${filter === s ? "border-primary bg-primary/10 font-medium text-primary" : "bg-card text-muted-foreground"}`}>{s}{s !== "全部" && ` ${count(s)}`}</button>
                ))}
              </div>
              {error ? <p className="py-8 text-center text-sm text-muted-foreground">请先 <Link to="/auth" className="text-primary underline">登录</Link> 后查看初筛名单</p>
                : isLoading ? <p className="py-8 text-center text-sm text-muted-foreground">加载中…</p>
                : list.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">暂无记录</p>
                : list.map((r) => {
                  const pos = ad8Positive(r.ad8);
                  return (
                    <Card key={r.id} className="space-y-2 p-3">
                      <div className="flex items-center gap-2"><b>{r.name}</b><span className="text-xs text-muted-foreground">{r.gender} · {r.age}岁</span><span className={`ml-auto rounded-full px-2 py-0.5 text-[15.4px] ${tone[r.status] ?? ""}`}>{r.status}</span></div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                        <span>体检：{r.exam_date}</span><span>电话：{r.phone}</span>
                        <span>AD-8：<b className={pos ? "text-destructive" : "text-foreground"}>{r.ad8}</b> {pos ? "阳性" : "阴性"}</span>
                        <span>训练站：{r.refer_to ?? "—"}</span>
                        {r.appointment_at && <span className="col-span-2">预约：{new Date(r.appointment_at).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>}
                      </div>
                      <div className="flex justify-end">
                        {r.status === "待核对" && <Button size="sm" variant="outline" onClick={() => open("verify", r)}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />核对</Button>}
                        {r.status === "已核对" && pos && <Button size="sm" onClick={() => open("refer", r)}><Send className="mr-1 h-3.5 w-3.5" />电话沟通</Button>}
                        {r.status === "已核对" && !pos && <span className="text-xs text-muted-foreground">宣教 + 年度复查</span>}
                        {r.status === "已沟通" && <Button size="sm" onClick={() => open("book", r)}><CalendarClock className="mr-1 h-3.5 w-3.5" />预约</Button>}
                        {r.status === "已预约" && <span className="text-xs text-success">已完成</span>}
                      </div>
                    </Card>
                  );
                })}
              <p className="flex gap-1 text-[15.4px] leading-[1.4rem] text-muted-foreground"><ClipboardList className="h-3.5 w-3.5 shrink-0" />AD-8 ≥2 分为异常，电话沟通后预约到小市社区认知训练站进一步评估；&lt;2 分纳入宣教与年度复查。</p>
            </main>
            {act && (
              <div className="absolute inset-0 z-30 flex items-end bg-foreground/40" onClick={() => setAct(null)}>
                <div role="dialog" aria-label="操作" className="w-full space-y-3 rounded-t-2xl bg-card p-4" onClick={(e) => e.stopPropagation()}>
                  <h2 className="font-semibold">{act.kind === "verify" ? "核对初筛结果" : act.kind === "refer" ? "电话沟通记录" : "预约到训练站"} · {act.row.name}</h2>
                  {act.kind === "verify" && <div><p className="mb-1 text-sm">AD-8 得分（0-8）</p><Input type="number" min={0} max={8} value={ad8} onChange={(e) => setAd8(e.target.value)} /></div>}
                  {act.kind === "refer" && <div className="rounded-lg border bg-muted/40 p-3 text-sm"><p>📞 {act.row.phone ?? "未留电话"}</p><p className="mt-1 text-xs text-muted-foreground">告知初筛异常，邀请到 {TARGETS[0]} 做进一步评估；在备注写下沟通结果。</p></div>}
                  {act.kind === "book" && <div><p className="mb-1 text-sm">预约时间（{act.row.refer_to}）</p><Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></div>}
                  <div><p className="mb-1 text-sm">备注</p><Textarea rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setAct(null)}>取消</Button><Button disabled={save.isPending} onClick={submit}>确认</Button></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
