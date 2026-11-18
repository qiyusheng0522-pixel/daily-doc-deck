import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Stethoscope, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const DEMO_EMAIL = "doctor.demo@glhospital.com";
// 密码需通过强度校验：demo123456 属于已泄露弱密码，注册会被后端拒绝 (weak_password)
const DEMO_PASSWORD = "GuLou@Neuro2026";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/doctor";
        navigate(from, { replace: true });
      }
      setChecking(false);
    };
    checkSession();
  }, [navigate, location]);

  const ensureDemoProfile = async (userId: string) => {
    const { data: existing } = await supabase.from("profiles").select("id").eq("id", userId).single();
    if (!existing) {
      await supabase.from("profiles").insert({
        id: userId,
        full_name: "王主任",
        role: "doctor",
        department: "神经内科",
        phone: "13800138001",
      });
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError?.message?.includes("Invalid login credentials")) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        toast({ title: "登录失败", description: signUpError.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      signInData = { session: signUpData.session, user: signUpData.user };
    } else if (signInError) {
      toast({ title: "登录失败", description: signInError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (signInData.user) {
      await ensureDemoProfile(signInData.user.id);
    }

    toast({ title: "登录成功", description: "欢迎进入医生工作站演示" });
    setLoading(false);
    navigate("/doctor", { replace: true });
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-4 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md space-y-6 p-8 shadow-elegant">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-doctor text-primary-foreground">
            <Stethoscope className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold">医生工作站</h1>
          <p className="text-center text-sm text-muted-foreground">南京市鼓楼医院 · 神经内科演示账号</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        <Button className="w-full bg-gradient-doctor" onClick={handleDemoSignIn} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? "登录中..." : "一键登录演示账号"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          演示账号会自动注册并登录,数据仅用于产品演示
        </p>
      </Card>
    </div>
  );
};

export default Auth;
