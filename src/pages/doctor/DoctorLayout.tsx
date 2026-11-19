import { useLocation } from "react-router-dom";
import { LayoutGrid, Users, ClipboardList, User as UserIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { doctor } from "@/data/doctorMock";
import { usePatientsRealtime, useMyProfile } from "@/data/patients";
import PadShell from "@/components/pad/PadShell";

export const tabs = [
  { to: "/doctor", icon: LayoutGrid, label: "工作台", end: true },
  { to: "/doctor/patients", icon: Users, label: "患者管理" },
  { to: "/doctor/plans", icon: ClipboardList, label: "方案审核" },
  { to: "/doctor/stats", icon: UserIcon, label: "我的" },
];

const DoctorLayout = () => {
  usePatientsRealtime();
  const { data: profile } = useMyProfile();
  const location = useLocation();
  const isChild = /^\/doctor\/(patients|plans|assess|self-assess)\/[^/]+/.test(location.pathname);
  return <PadShell tabs={tabs} frameAttr="data-doctor-frame" hideHeader={isChild}
    name={profile?.full_name ?? "李医生"} dept={profile?.department ?? "记忆门诊"} initial={doctor.initial}
    caption="医生端 · PAD 横屏预览" onBell={() => toast({ title: "您有待办提醒", description: "请在工作台查看" })} />;
};

export default DoctorLayout;
