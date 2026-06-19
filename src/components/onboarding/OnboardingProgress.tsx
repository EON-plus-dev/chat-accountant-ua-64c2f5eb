import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { OnboardingStep, ONBOARDING_STEPS } from "@/config/onboardingConfig";

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  className?: string;
}

// Simplified 4-step progress mapping
const PROGRESS_STEPS = [
  { id: 'welcome', title: 'Вітання', matchSteps: ['welcome'] },
  { id: 'connect', title: 'Підключення', matchSteps: ['auth-method', 'kep-auth', 'registry-sync'] },
  { id: 'setup', title: 'Налаштування', matchSteps: ['verify-data', 'ai-personalization'] },
  { id: 'done', title: 'Готово', matchSteps: ['interactive-tour', 'complete'] },
];

export const OnboardingProgress = ({
  currentStep,
  completedSteps,
  className,
}: OnboardingProgressProps) => {
  // Find which progress step we're on
  const getCurrentProgressIndex = () => {
    for (let i = 0; i < PROGRESS_STEPS.length; i++) {
      if (PROGRESS_STEPS[i].matchSteps.includes(currentStep)) {
        return i;
      }
    }
    return 0;
  };
  
  const currentProgressIndex = getCurrentProgressIndex();
  
  // Check if a progress step is completed
  const isStepCompleted = (stepIndex: number) => {
    return stepIndex < currentProgressIndex;
  };
  
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop progress - 4 steps */}
      <div className="hidden md:flex items-center justify-center gap-2">
        {PROGRESS_STEPS.map((step, index) => {
          const isCompleted = isStepCompleted(index);
          const isCurrent = index === currentProgressIndex;
          
          return (
            <div key={step.id} className="flex items-center">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1.5 whitespace-nowrap",
                    isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>
              
              {/* Connector line */}
              {index < PROGRESS_STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-16 h-0.5 mx-3 transition-all duration-300",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Mobile progress - simplified bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {PROGRESS_STEPS[currentProgressIndex]?.title || 'Онбординг'}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentProgressIndex + 1}/{PROGRESS_STEPS.length}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${((currentProgressIndex + 1) / PROGRESS_STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};