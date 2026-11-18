import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ChevronRight, MessageSquare, Hospital, Stethoscope, UploadCloud } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ActionSheet from "@/components/nurse/ActionSheet";
import {
  usePatients,
  useCreateUpload,
  useReferrals,
  useReceiveReferral,
  sourceLabel,
  type CommunityStage,
  type Patient,
} from "@/data/patients";

const stageTabs: ("全部" | CommunityStage)[] = ["全部", "新接收", "干预中", "待复评", "历史"];

const CommunityPatients = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>(
    params.get("tab") === "new" ? "新接收" : params.get("tab") === "abnormal" ? "随访中" : "全部",
  );
  const [conditionFilter, setConditionFilter] = useState<string>("全部疾病");
  const [referFor, setReferFor] = useState<Patient | null>(null);
  const [uploadFor, setUploadFor] = useState<Patient | null>(null);

  const { data: allPatients = [], isLoading } = usePatients("community");
  const upload = useCreateUpload();
  const { data: referrals = [] } = useReferrals();
  const receive = useReceiveReferral();

  // 护士端「出院转交」发出的下转单在这里接收；接收后患者才进入社区在管列表。
  const pendingReferrals = referrals.filter((r) => r.status === "待接收");

  const receiveReferral = (r: (typeof pendingReferrals)[number]) => {
    receive.mutate(
      { referralId: r.id, patientId: r.patient_id },
      {
        onSuccess: () =>
          toast({
            title: `${r.patients?.name ?? "患者"} 已接收`,
            description: "已进入社区在管列表，可安排随访",
          }),
        onError: (e: Error) => toast({ title: "接收失败", description: e.message, variant: "destructive" }),
      },
    );
  };

  const conditions = useMemo(() => {
    const set = new Set<string>(["全部疾病"]);
    allPatients.forEach((p) => p.condition_category && set.add(p.condition_category));
    return Array.from(set);
  }, [allPatients]);

  const list = useMemo(
    () =>
      allPatients
        .filter((p) => {
          const ms = !search || p.name.includes(search);
          const mf = filter === "全部" || p.community_stage === filter;
          const mc = conditionFilter === "全部疾病" || p.condition_category === conditionFilter;
          return ms && mf && mc;
        })
        .sort((a, b) => Number(b.abnormal) - Number(a.abnormal)),
    [allPatients, search, filter, conditionFilter],
  );

  // 「新接收」= 待接收的下转单 + 已接收但尚未开始随访的患者。
  const stageCount = (s: CommunityStage) =>
    allPatients.filter((p) => p.community_stage === s).length + (s === "新接收" ? pendingReferrals.length : 0);

  const showPending = filter === "全部" || filter === "新接收";
  const totalShown = list.length + (showPending ? pendingReferrals.length : 0);

  const confirmReferral = () => {
    if (!referFor) return;
    const p = referFor;
    setReferFor(null);
    navigate(`/community/chat/patient/${p.id}`, {
      state: {
        referral: {
          dept: p.refer_dept ?? "神经内科",
          doctor: p.refer_doctor ?? "王主任",
          url: "https://www.njglyy.com/",
        },
      },
    });
  };

  const confirmUpload = () => {
    if (!uploadFor) return;
    const p = uploadFor;
    upload.mutate(
      { patientId: p.id, note: `社区随访记录上传，申请${p.refer_dept ?? "神经内科"}复诊` },
      {
        onSuccess: () => {
          setUploadFor(null);
          toast({
            title: `${p.name} 已上传至鼓楼医院`,
            description: "可继续为该患者预约鼓楼医院互联网医院复诊入口",
          });
        },
        onError: (e: Error) => toast({ title: "上传失败", description: e.message, variant: "destructive" }),
      },
    );
  };

  return (
    <div className="space-y-3 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="搜索患者姓名" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-8 text-sm" />
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {stageTabs.map((t) => {
          const active = filter === t;
          const count = t === "全部" ? allPatients.length + pendingReferrals.length : stageCount(t);
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                active ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {t}
              <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-white/20" : "bg-muted text-muted-foreground"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
        {conditions.map((c) => {
          const active = conditionFilter === c;
          return (
            <button
              key={c}
              onClick={() => setConditionFilter(c)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] transition-colors ${
                active ? "border-accent bg-accent/10 text-accent" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">患者列表</h3>
          <span className="text-xs text-muted-foreground">{totalShown} 位</span>
        </div>
        <div className="divide-y">
          {showPending &&
            pendingReferrals.map((r) => (
              <div key={r.id} className="flex w-full items-center gap-3 bg-warning/5 px-4 py-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warning/15 text-base font-semibold text-warning">
                  {(r.patients?.name ?? "新")[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">{r.patients?.name ?? "患者"}</span>
                    <Badge variant="outline" className="h-4 border-warning px-1 text-[9px] text-warning">
                      待接收
                    </Badge>
                    {r.patients && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {sourceLabel(r.patients.source)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{r.reason ?? "出院下转"}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {r.from_hospital} → {r.to_community} · 下转医生 {r.doctor_name ?? "—"}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="shrink-0 bg-gradient-community text-[11px]"
                  onClick={() => receiveReferral(r)}
                  disabled={receive.isPending}
                >
                  接收
                </Button>
              </div>
            ))}
          {isLoading && <p className="px-4 py-10 text-center text-sm text-muted-foreground">加载中…</p>}
          {!isLoading && list.length === 0 && (!showPending || pendingReferrals.length === 0) && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">无匹配患者</p>
          )}
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/community/patients/${p.id}`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
                  p.abnormal ? "bg-destructive/15 text-destructive" : "bg-accent/10 text-accent"
                }`}
              >
                {p.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {p.gender} · {p.age}岁
                  </span>
                  {p.abnormal && <Badge variant="destructive" className="h-4 px-1 text-[9px]">异常</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      p.source === "南京市鼓楼医院" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                    }`}
                  >
                    {sourceLabel(p.source)}
                  </span>
                  <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">{p.condition_category}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{p.community_stage}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{p.last_visit}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/community/chat/patient/${p.id}`);
                    }}
                    className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 text-[10px] text-accent"
                  >
                    <MessageSquare className="h-3 w-3" />
                    沟通
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setReferFor(p);
                    }}
                    className="flex items-center gap-1 rounded-full border border-warning/30 bg-warning/5 px-2 py-0.5 text-[10px] text-warning"
                  >
                    <Hospital className="h-3 w-3" />
                    转诊鼓楼
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadFor(p);
                    }}
                    className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10px] text-primary"
                  >
                    <UploadCloud className="h-3 w-3" />
                    上传鼓楼
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </Card>

      {/* 转诊鼓楼 */}
      <ActionSheet
        open={!!referFor}
        onOpenChange={(v) => !v && setReferFor(null)}
        title="转诊至南京市鼓楼医院"
        description={referFor ? `为 ${referFor.name} 推荐互联网医院挂号` : ""}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setReferFor(null)}>
              取消
            </Button>
            <Button className="bg-gradient-community" onClick={confirmReferral}>
              <Hospital className="mr-1 h-4 w-4" />
              确认
            </Button>
          </div>
        }
      >
        {referFor && (
          <div className="space-y-3 py-2 text-xs">
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">接收科室</p>
              <p className="mt-1 font-medium">南京市鼓楼医院 · {referFor.refer_dept ?? "神经内科"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">推荐医生</p>
              <p className="mt-1 flex items-center gap-1.5 font-medium">
                <Stethoscope className="h-3.5 w-3.5 text-primary" />
                {referFor.refer_doctor ?? "王主任"} · {referFor.refer_dept ?? "神经内科"}
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-muted-foreground">
              确认后将跳转至与患者的沟通界面，并自动发送 {referFor.refer_doctor ?? "王主任"} 的互联网医院挂号地址，由患者自主完成挂号。
            </div>
          </div>
        )}
      </ActionSheet>

      {/* 上传至鼓楼医院：单患者操作 */}
      <ActionSheet
        open={!!uploadFor}
        onOpenChange={(v) => !v && setUploadFor(null)}
        title="上传至鼓楼医院"
        description={uploadFor ? `仅上传 ${uploadFor.name} 一人的社区随访记录` : ""}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setUploadFor(null)}>
              取消
            </Button>
            <Button className="bg-gradient-community" onClick={confirmUpload} disabled={upload.isPending}>
              <UploadCloud className="mr-1 h-4 w-4" />
              {upload.isPending ? "上传中…" : "确认上传"}
            </Button>
          </div>
        }
      >
        {uploadFor && (
          <div className="space-y-3 py-2 text-xs">
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">患者</p>
              <p className="mt-1 font-medium">
                {uploadFor.name} · {uploadFor.gender} · {uploadFor.age}岁
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">上传内容</p>
              <p className="mt-1 font-medium">社区随访记录 · 血压与用药依从性 · 出院后状况</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-muted-foreground">
              上传成功后可继续为该患者预约南京市鼓楼医院互联网医院复诊入口。
            </div>
          </div>
        )}
      </ActionSheet>
    </div>
  );
};

export default CommunityPatients;
