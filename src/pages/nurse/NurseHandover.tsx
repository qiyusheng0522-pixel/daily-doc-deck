import { useState } from "react";
import { LogOut, FileText, Send, History, ChevronRight, User, CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { usePatients, useCreateReferral, useReferrals, type Patient } from "@/data/patients";

const NurseHandover = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [note, setNote] = useState("");

  const { data: inpatients = [], isLoading } = usePatients("hospital");
  const { data: referrals = [] } = useReferrals();
  const createReferral = useCreateReferral();

  // 出院待交接 = 在院阶段为「待出院」的患者，与患者列表看到的是同一批人。
  const dischargeList = inpatients.filter((p) => p.hospital_stage === "待转诊");
  const handoverHistory = referrals.filter((r) => r.status === "已接收");

  const sendHandover = () => {
    if (!selected) return;
    createReferral.mutate(
      {
        patientId: selected.id,
        reason: note.trim() || `${selected.diagnosis} · 出院下转社区随访`,
        doctorName: selected.refer_doctor ?? undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "交接已发送",
            description: `${selected.name} 已下转小市社区，等待社区接收`,
          });
          setSelected(null);
          setNote("");
        },
        onError: (e: Error) => toast({ title: "交接发送失败", description: e.message, variant: "destructive" }),
      },
    );
  };

  if (selected) {
    return (
      <div className="space-y-4 p-4">
        <button onClick={() => setSelected(null)} className="text-sm text-muted-foreground hover:text-foreground">
          ← 返回列表
        </button>

        {/* 患者信息 */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-nurse text-primary-foreground">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{selected.name}</p>
              <p className="text-xs text-muted-foreground">
                床位 {selected.bed_number ?? "—"} · 主治 {selected.refer_doctor ?? "—"} · {selected.source}
              </p>
            </div>
            <Badge variant="secondary">{selected.hospital_stage}</Badge>
          </div>
        </Card>

        {/* 交接准备 */}
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/30 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">交接准备</span>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">护理记录汇总</p>
              <div className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed">
                主要诊断 {selected.diagnosis}。当前血压 {selected.bp}、心率 {selected.hr}、LDL {selected.ldl}、空腹血糖 {selected.glucose}；
                MMSE {selected.nihss}、MoCA {selected.mrs}、{selected.limb_power}。过敏史：{selected.allergy ?? "无"}。
                建议社区每周随访血压一次，并按医嘱继续二级预防用药。
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">交接内容（自动生成）</p>
              <div className="space-y-1.5">
                {["用药清单与剂量", "复查计划 · 2 周后", "饮食与康复训练建议", "应急联系方式"].map((it) => (
                  <div key={it} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    <span>{it}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">补充说明</p>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="可补充交接事项..."
                className="min-h-[70px] text-xs"
              />
            </div>
          </div>
        </Card>

        {/* 一键交接 */}
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/30 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Send className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold">一键交接</span>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">转交去向</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "转入社区", desc: "小市社区认知训练站 · 记忆门诊随访" },
                  { label: "居家护理", desc: "由家属/居家护理协助" },
                ].map((r) => (
                  <div key={r.label} className="rounded-lg border bg-card p-3 text-left">
                    <p className="text-xs font-semibold">{r.label}</p>
                    <p className="mt-0.5 text-[14px] text-muted-foreground">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <Button className="w-full bg-gradient-nurse" size="lg" onClick={sendHandover} disabled={createReferral.isPending}>
              <Send className="mr-2 h-4 w-4" />
              {createReferral.isPending ? "发送中…" : "发送交接"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setActiveTab("pending")}
          className={`rounded-md py-1.5 text-sm font-medium transition-all ${
            activeTab === "pending" ? "bg-card shadow-soft" : "text-muted-foreground"
          }`}
        >
          出院列表
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`rounded-md py-1.5 text-sm font-medium transition-all ${
            activeTab === "history" ? "bg-card shadow-soft" : "text-muted-foreground"
          }`}
        >
          交接记录
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="text-xl font-semibold text-primary">{dischargeList.length}</p>
          <p className="text-[15.4px] text-muted-foreground">待出院</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-semibold text-warning">{referrals.filter((r) => r.status === "待接收").length}</p>
          <p className="text-[15.4px] text-muted-foreground">待社区接收</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-semibold text-success">{handoverHistory.length}</p>
          <p className="text-[15.4px] text-muted-foreground">社区已接收</p>
        </Card>
      </div>

      {activeTab === "pending" ? (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-1.5">
              <LogOut className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">出院待交接</h3>
            </div>
          </div>
          <div className="divide-y">
            {isLoading && <p className="px-4 py-8 text-center text-sm text-muted-foreground">加载中…</p>}
            {!isLoading && dischargeList.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">暂无待出院患者</p>
            )}
            {dischargeList.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                  {p.bed_number ?? "—"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{p.name}</span>
                    <Badge variant={p.abnormal ? "destructive" : "secondary"} className="h-4 px-1 text-[12.6px]">
                      {p.abnormal ? "异常" : "平稳"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[15.4px] text-muted-foreground">
                    {p.diagnosis} · {p.source}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-1.5">
              <History className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">历史交接记录</h3>
            </div>
          </div>
          <div className="divide-y">
            {handoverHistory.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">暂无交接记录</p>}
            {handoverHistory.map((h) => (
              <div key={h.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {h.patients?.name ?? "患者"} · {h.to_community}
                    </p>
                    <p className="mt-0.5 text-[15.4px] text-muted-foreground">下转医生：{h.doctor_name ?? "—"}</p>
                  </div>
                  <Badge variant="outline" className="h-5 border-success text-[14px] text-success">
                    <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />
                    {h.status}
                  </Badge>
                </div>
                <p className="mt-1 flex items-center gap-1 text-[15.4px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {h.received_at?.slice(0, 16).replace("T", " ") ?? h.created_at.slice(0, 16).replace("T", " ")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default NurseHandover;
