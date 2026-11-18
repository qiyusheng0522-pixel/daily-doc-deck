import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// 演示环境：未登录时自动以演示账号登录（该账号同时拥有各端角色），
// 保证各端的保存、转诊、评估等操作行为一致，不因未登录而失败。
const DEMO_EMAIL = "doctor.demo@glhospital.com";
const DEMO_PASSWORD = "GuLou@Neuro2026";

export default function DemoSession() {
  const qc = useQueryClient();
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) return;
      const { error } = await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
      if (!error) qc.invalidateQueries();
      else console.warn("demo sign-in failed", error.message);
    });
  }, [qc]);
  return null;
}
