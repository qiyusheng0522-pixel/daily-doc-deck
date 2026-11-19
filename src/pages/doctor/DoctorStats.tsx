import { doctor } from "@/data/doctorMock";
import { LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePatients, useReferrals } from "@/data/patients";
import { doctorServiceStats } from "@/data/doctorServiceStats";
import { Button } from "@/components/ui/button";

const DoctorStats = () => {
  const navigate = useNavigate();
  const patients = usePatients("all");
  const referrals = useReferrals();
  const stats = doctorServiceStats(patients.data ?? [], referrals.data ?? []);
  const ready = patients.isSuccess && referrals.isSuccess;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return toast({ title: "退出失败，请重试" });
    toast({ title: "已退出登录" });
    navigate("/auth");
  };

  return (
    <div className="space-y-4 px-4 py-3">
      <section className="bg-gradient-primary p-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-xl font-bold">{doctor.initial}</div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold">{doctor.name}</p>
            <p className="mt-1 text-xs opacity-90">评估医生 · 记忆门诊</p>
            <p className="mt-1 text-xs opacity-80">南京市鼓楼医院 · 演示账号</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-primary-foreground/20 pt-4 text-center">
          <div><p className="text-xs opacity-80">在管患者</p><p className="mt-1 text-xl font-semibold">{ready ? stats.managedCount : "—"}</p></div>
          <div><p className="text-xs opacity-80">转诊率</p><p className="mt-1 text-xl font-semibold">{ready && stats.referralRate !== null ? `${stats.referralRate}%` : "—"}</p></div>
        </div>
      </section>
      <section className="border-b border-border px-1 py-3">
        <div className="flex items-center justify-between text-sm"><span>下转患者</span><span className="font-semibold text-primary">{ready ? `${stats.referredCount} 人` : "—"}</span></div>
        <p className="mt-2 text-xs text-muted-foreground">统计口径：有下转记录的在管患者人数 ÷ 在管患者人数，同一患者不重复计算。</p>
        {(patients.isError || referrals.isError) && <p className="mt-2 text-xs text-destructive">统计读取失败，请稍后重试</p>}
      </section>
      <Button variant="outline" className="w-full text-destructive" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />退出登录</Button>
    </div>
  );
};
export default DoctorStats;
