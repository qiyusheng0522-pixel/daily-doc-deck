import { useLocation } from "react-router-dom";
import { Home, Users, BookOpen, Stethoscope } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePatientsRealtime } from "@/data/patients";
import PadShell from "@/components/pad/PadShell";

const tabs = [
  { to: "/community", icon: Home, label: "工作台", end: true },
  { to: "/community/patients", icon: Users, label: "患者档案" },
  { to: "/community/followup", icon: Stethoscope, label: "随访管理" },
  { to: "/community/education", icon: BookOpen, label: "宣教管理" },
];

const CommunityLayout = () => {
  usePatientsRealtime();
  const location = useLocation();
  return <PadShell tabs={tabs} frameAttr="data-community-frame" community hideHeader={location.pathname.startsWith("/community/patients/")}
    name="张护士" dept="小市社区认知训练站" initial="张" caption="社区护理康复端 · 小市社区 · PAD 横屏预览" onBell={() => toast({ title: "暂无新通知" })} />;
};

export default CommunityLayout;
