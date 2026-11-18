import { useState } from "react";
import { Link } from "react-router-dom";
import { chats } from "@/data/doctorMock";
import { Search, ChevronRight } from "lucide-react";

const DoctorCommunication = () => {
  const [tab, setTab] = useState<"客户" | "未读">("客户");
  const [q, setQ] = useState("");
  const list = chats
    .filter((c) => (tab === "未读" ? c.unread > 0 : true))
    .filter((c) => !q || c.patientName.includes(q));

  return (
    <div>
      <div className="grid grid-cols-2 border-b bg-card">
        {(["客户", "未读"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative py-3 text-sm font-medium ${tab === t ? "text-foreground" : "text-muted-foreground"}`}
          >
            {t}
            {tab === t && <span className="absolute inset-x-1/3 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <main className="px-4 py-3">
        <div className="mb-3 flex items-center gap-2 rounded-full bg-card px-4 py-2.5 shadow-sm ring-1 ring-border/60">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索患者姓名"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <button className="mb-3 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground">
          全部 ({chats.length})
        </button>

        <ul className="space-y-3">
          {list.map((c) => (
            <li key={c.id}>
              <Link
                to={`/doctor/chat/${c.patientId}`}
                className="block rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                    {c.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold">{c.patientName}</span>
                      {c.unread > 0 && (
                        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center whitespace-nowrap rounded-full bg-destructive px-1.5 text-[11px] font-semibold text-destructive-foreground">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">创建于 {c.createdAt}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.tags.map((t) => (
                        <span key={t} className="whitespace-nowrap rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">{t}</span>
                      ))}
                      {c.warnings.map((t) => (
                        <span key={t} className="whitespace-nowrap rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">{t}</span>
                      ))}
                    </div>
                    <p className="mt-2 truncate text-xs text-muted-foreground">💬 {c.lastMessage}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default DoctorCommunication;
