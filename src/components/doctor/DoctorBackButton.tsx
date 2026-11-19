import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function hasPreviousAppPage(state: unknown): boolean {
  return typeof state === "object" && state !== null && "idx" in state &&
    typeof state.idx === "number" && state.idx > 0;
}

export default function DoctorBackButton({ fallback }: { fallback: string }) {
  const navigate = useNavigate();
  return <Button variant="ghost" size="sm" aria-label="返回" className="shrink-0 px-1 text-primary"
    onClick={() => hasPreviousAppPage(window.history.state) ? navigate(-1) : navigate(fallback, { replace: true })}>
    <ArrowLeft className="h-4 w-4" />返回
  </Button>;
}