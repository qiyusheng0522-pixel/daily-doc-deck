import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const sessions = [
  { id: 1, kind: "patient" as const, name: "张伟", sub: "MCI 确诊 · 新接收", last: "老师，最近晚上总睡不好。", time: "09:31", unread: 2, abnormal: true, vitals: { MMSE: "24", MoCA: "21", 血压: "138/86" } },
  { id: 3, kind: "patient" as const, name: "李建国", sub: "MCI · 干预中", last: "今天的家庭训练作业做完了。", time: "08:45", unread: 0, abnormal: true, vitals: { MoCA: "22", 训练: "完成" } },
  { id: 2, kind: "patient" as const, name: "李娜", sub: "床 0508 · 轻度认知障碍 · 周围神经病变", last: "好的谢谢。", time: "昨日", unread: 0, abnormal: false, vitals: { 收缩压: "5.5", MMSE: "8.0%", 血压: "126/78" } },
  { id: 4, kind: "doctor" as const, name: "王主任", sub: "记忆门诊 · 主治医师", last: "请复测一次餐后 2h 血压。", time: "09:14", unread: 1, abnormal: false },
];

const NurseChatList = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const list = sessions.filter((s) => !q || s.name.includes(q) || s.sub.includes(q));

  return (
    <div className="space-y-3 p-4">
      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索患者/医生" className="h-9 pl-8 text-sm" />
      </div>

      {/* 会话列表 */}
      <Card className="overflow-hidden">
        <div className="divide-y">
          {list.map((s) => (
            <button
              key={`${s.kind}-${s.id}`}
              onClick={() => navigate(`/nurse/chat/${s.kind}/${s.id}`)}
              className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <div className="relative shrink-0">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${s.kind === "doctor" ? "bg-primary/15 text-primary" : s.abnormal ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"}`}>
                  {s.kind === "doctor" ? <Stethoscope className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                {s.unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                    {s.unread}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">{s.name}</span>
                    {s.abnormal && (
                      <span className="shrink-0 rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-bold text-destructive">异常</span>
                    )}
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{s.time}</span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{s.sub}</p>
                <p className="mt-0.5 truncate text-xs text-foreground/80">{s.last}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default NurseChatList;
