import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { AddCabinetStep, AddCabinetScenario, PROGRESS_STAGES } from "@/config/addCabinetConfig";

interface AddCabinetProgressProps {
  currentStep: AddCabinetStep;
  completedSteps: AddCabinetStep[];
  scenario: AddCabinetScenario | null;
  className?: string;
}

export const AddCabinetProgress = ({
  currentStep,
  completedSteps,
  scenario,
  className,
}: AddCabinetProgressProps) => {
  // Don't show progress for member scenario or on complete step
  if (scenario === 'member' || currentStep === 'complete') {
    return null;
  }

  // Get current stage
  const getCurrentStage = () => {
    const stage = PROGRESS_STAGES.find(s => s.steps.includes(currentStep));
    return stage?.stage || 1;
  };

  const currentStage = getCurrentStage();
  const totalStages = PROGRESS_STAGES.length;

  // Check if a stage is complete
  const isStageComplete = (stageNum: number) => {
    const stage = PROGRESS_STAGES.find(s => s.stage === stageNum);
    if (!stage) return false;
    return stage.steps.every(step => completedSteps.includes(step as AddCabinetStep));
  };

  // Calculate progress percentage for mobile bar
  const progressPercentage = ((currentStage - 1) / (totalStages - 1)) * 100;

  return (
    <div className={cn("sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b", className)}>
      {/* Desktop: Step indicators */}
      <div className="hidden md:flex items-center justify-center gap-2 py-4 px-6">
        {PROGRESS_STAGES.map((stage, index) => {
          const isComplete = isStageComplete(stage.stage);
          const isCurrent = stage.stage === currentStage;
          const isPast = stage.stage < currentStage;

          return (
            <div key={stage.stage} className="flex items-center">
              {/* Stage indicator */}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isComplete || isPast
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete || isPast ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    stage.stage
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {stage.title}
                </span>
              </div>

              {/* Connector line */}
              {index < PROGRESS_STAGES.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-3 transition-colors",
                    isPast || isComplete ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Progress bar */}
      <div className="md:hidden px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {PROGRESS_STAGES.find(s => s.stage === currentStage)?.title}
          </span>
          <span className="text-xs text-muted-foreground">
            {currentStage} з {totalStages}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${Math.max(progressPercentage, 10)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
