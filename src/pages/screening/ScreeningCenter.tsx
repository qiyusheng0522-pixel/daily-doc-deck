import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, CheckCircle2, ClipboardList, RefreshCw, Send, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ad8Positive } from "@/data/cognitive";
import type { Tables } from "@/integrations/supabase/types";

type Row = Tables<"screenings">;
const STATUSES = ["全部", "待核对", "已核对", "已转介", "已预约"] as const;
const TARGETS = ["小市社区认知训练站", "鼓楼医院记忆门诊"];
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
  已转介: "bg-accent/15 text-accent", 已预约: "bg-success/15 text-success",
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
      const { error } = await supabase.from("screenings").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["screenings"] }); setAct(null); },
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
      save.mutate({ id: row.id, status: "已转介", refer_to: target, note: note || null },
        { onSuccess: () => toast({ title: `已转介至${target}` }) });
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
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground"><Stethoscope className="h-5 w-5" /></div>
            <div><h1 className="text-lg font-semibold">体检中心筛查端</h1><p className="text-xs text-muted-foreground">核对初筛结果 · 登记转介 · 预约</p></div>
          </div>
          <Button variant="outline" size="sm" disabled title="体检系统接口尚未接入"><RefreshCw className="mr-1 h-4 w-4" />从体检系统同步（未接入）</Button>
        </div>
      </header>

      <main className="container mx-auto space-y-4 py-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[["初筛总数", rows.length], ["AD-8 阳性(≥2)", positive], ["待核对", count("待核对")], ["已转介", count("已转介")], ["已预约", count("已预约")]].map(([k, v]) => (
            <Card key={k as string} className="p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-2xl font-bold">{v}</p></Card>
          ))}
        </div>

        <Card className="p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`rounded-full border px-3 py-1 text-sm ${filter === s ? "border-primary bg-primary/10 font-medium text-primary" : "text-muted-foreground"}`}>
                {s}{s !== "全部" && ` ${count(s)}`}
              </button>
            ))}
          </div>
          {error ? <p className="py-8 text-center text-sm text-muted-foreground">请先 <Link to="/auth" className="text-primary underline">登录</Link> 后查看初筛名单</p>
            : isLoading ? <p className="py-8 text-center text-sm text-muted-foreground">加载中…</p>
            : list.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">暂无记录{rows.length === 0 && "（请确认已登录）"}</p> : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground"><tr className="border-b">
                {["体检日期", "姓名", "性别/年龄", "电话", "AD-8", "状态", "转介去向", "预约时间", "操作"].map((h) => <th key={h} className="py-2 font-normal">{h}</th>)}
              </tr></thead>
              <tbody>
                {list.map((r) => {
                  const pos = ad8Positive(r.ad8);
                  return (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2.5">{r.exam_date}</td>
                      <td className="font-medium">{r.name}</td>
                      <td>{r.gender} · {r.age}岁</td>
                      <td className="text-muted-foreground">{r.phone}</td>
                      <td><span className={pos ? "font-bold text-destructive" : ""}>{r.ad8}</span> <span className="text-xs text-muted-foreground">{pos ? "阳性" : "阴性"}</span></td>
                      <td><span className={`rounded-full px-2 py-0.5 text-xs ${tone[r.status] ?? ""}`}>{r.status}</span></td>
                      <td className="text-xs">{r.refer_to ?? "—"}</td>
                      <td className="text-xs">{r.appointment_at ? new Date(r.appointment_at).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                      <td className="space-x-1 whitespace-nowrap">
                        {r.status === "待核对" && <Button size="sm" variant="outline" onClick={() => open("verify", r)}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />核对</Button>}
                        {r.status === "已核对" && pos && <Button size="sm" onClick={() => open("refer", r)}><Send className="mr-1 h-3.5 w-3.5" />登记转介</Button>}
                        {r.status === "已核对" && !pos && <span className="text-xs text-muted-foreground">宣教 + 年度复查</span>}
                        {r.status === "已转介" && <Button size="sm" onClick={() => open("book", r)}><CalendarClock className="mr-1 h-3.5 w-3.5" />预约</Button>}
                        {r.status === "已预约" && <span className="text-xs text-success">已完成</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
        <p className="flex items-center gap-1 text-xs text-muted-foreground"><ClipboardList className="h-3.5 w-3.5" />规则：AD-8 ≥2 分为阳性，转介至训练站做 MMSE/MoCA 评估或至记忆门诊；&lt;2 分纳入健康宣教与年度复查。</p>
      </main>

      <Dialog open={!!act} onOpenChange={(o) => !o && setAct(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{act?.kind === "verify" ? "核对初筛结果" : act?.kind === "refer" ? "登记转介" : "登记预约"} · {act?.row.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {act?.kind === "verify" && (
              <div><p className="mb-1 text-sm">AD-8 得分（0-8）</p><Input type="number" min={0} max={8} value={ad8} onChange={(e) => setAd8(e.target.value)} /></div>
            )}
            {act?.kind === "refer" && (
              <div className="grid grid-cols-2 gap-2">
                {TARGETS.map((t) => (
                  <button key={t} onClick={() => setTarget(t)} className={`rounded-lg border p-3 text-sm ${target === t ? "border-primary bg-primary/10 text-primary" : ""}`}>{t}</button>
                ))}
              </div>
            )}
            {act?.kind === "book" && (
              <div><p className="mb-1 text-sm">预约时间（{act.row.refer_to}）</p><Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></div>
            )}
            <div><p className="mb-1 text-sm">备注</p><Textarea rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAct(null)}>取消</Button><Button disabled={save.isPending} onClick={submit}>确认</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
