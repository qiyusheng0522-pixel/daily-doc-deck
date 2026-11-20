import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, ClipboardList, ChevronRight, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GuideStep {
  title: string;
  desc: string;
  action: string;
  to: string;
  icon: typeof Camera;
}

const STEPS: GuideStep[] = [
  {
    title: "档案上传",
    desc: "拍照上传出院小结 / 病历，OCR 自动识别",
    action: "去上传",
    to: "/patient/archive",
    icon: Camera,
  },
  {
    title: "风险评估",
    desc: "填写自评量表，AI 结合档案生成风险报告",
    action: "去填写",
    to: "/patient/assessment",
    icon: ClipboardList,
  },
  {
    title: "查看健康方案",
    desc: "在「居家方案」中查看专属训练方案",
    action: "去查看",
    to: "/patient/plan",
    icon: Heart,
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** 家庭端使用引导：三步向导，仅覆盖 phone-screen 内。 */
const PatientGuideWizard = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(open);
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) {
      setStep(0);
      setMounted(true);
      requestAnimationFrame(() => setShow(true));
    } else {
      setShow(false);
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const goAction = () => {
    onOpenChange(false);
    navigate(current.to);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-[60] overflow-hidden">
      <div
        className={cn(
          "pointer-events-auto absolute inset-0 flex flex-col bg-background transition-transform duration-200 ease-out",
          show ? "translate-y-0" : "translate-y-full",
        )}
      >
        <header className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <h3 className="text-base font-semibold">使用引导</h3>
            <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
              {step + 1}/{STEPS.length}
            </span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1 hover:bg-primary-foreground/10"
            aria-label="关闭引导"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </header>

        <div className="flex items-center gap-2 px-8 pt-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex flex-1 items-center gap-2 last:flex-none">
              <button
                onClick={() => setStep(i)}
                aria-label={`第 ${i + 1} 步 ${s.title}`}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <span className={cn("h-0.5 flex-1 rounded-full", i < step ? "bg-primary/40" : "bg-muted")} />
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 px-5 pt-6">
          <button
            onClick={goAction}
            className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left shadow-card transition-colors hover:bg-muted/50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <current.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold">
                第 {step + 1} 步 · {current.title}
              </span>
              <span className="mt-1 block whitespace-normal text-sm text-muted-foreground">{current.desc}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </button>

          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              上一步
            </Button>
            {!isLast && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              >
                下一步
              </Button>
            )}
          </div>
        </div>

        <footer className="flex items-center justify-between border-t bg-muted/20 px-5 py-4">
          <Button variant="ghost" className="text-muted-foreground" onClick={() => onOpenChange(false)}>
            跳过引导
          </Button>
          <Button onClick={goAction}>
            {current.action}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default PatientGuideWizard;
