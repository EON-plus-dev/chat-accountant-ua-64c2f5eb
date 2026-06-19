import { Upload, FileText, TestTube, Eye, Save, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplateWizardStep } from "./CreateTemplatePage";

type IndicatorVariant = "full" | "compact" | "text";

interface TemplateStepIndicatorProps {
  currentStep: TemplateWizardStep;
  variant?: IndicatorVariant;
}

const steps: { id: TemplateWizardStep; label: string; icon: typeof Upload }[] = [
  { id: "upload", label: "Завантаження", icon: Upload },
  { id: "editor", label: "Редагування", icon: FileText },
  { id: "test", label: "Тестування", icon: TestTube },
  { id: "preview", label: "Перегляд", icon: Eye },
  { id: "save", label: "Збереження", icon: Save },
];

export const TemplateStepIndicator = ({ 
  currentStep, 
  variant = "full" 
}: TemplateStepIndicatorProps) => {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  // Text variant: just "2/5" style
  if (variant === "text") {
    return (
      <span className="text-xs text-muted-foreground font-medium tabular-nums">
        {currentIndex + 1}/{steps.length}
      </span>
    );
  }

  // Compact variant: smaller dots without icons
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  isCompleted && "bg-success",
                  isCurrent && "bg-primary",
                  !isCompleted && !isCurrent && "bg-muted-foreground/30"
                )}
              />
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-2 h-0.5 mx-0.5",
                    index < currentIndex ? "bg-success" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Full variant: circles with icons (default)
  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-colors",
                isCompleted && "bg-success text-success-foreground",
                isCurrent && "bg-primary text-primary-foreground",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-3 sm:w-6 h-0.5 mx-0.5 sm:mx-1",
                  index < currentIndex ? "bg-success" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
