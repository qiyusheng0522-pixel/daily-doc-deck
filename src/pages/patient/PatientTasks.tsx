import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import FamilyTasks from "@/components/patient/FamilyTasks";

export default function PatientTasks() {
  const navigate = useNavigate();
  return <div className="space-y-4 p-4"><header className="flex items-center gap-3"><Button size="icon" variant="ghost" aria-label="返回首页" onClick={() => navigate("/patient")}><ArrowLeft className="h-4 w-4" /></Button><h1 className="text-lg font-semibold">家庭任务</h1></header><FamilyTasks /></div>;
}
