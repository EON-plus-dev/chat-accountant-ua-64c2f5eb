/**
 * ActionBadgeStepper — Badge-based action progress indicator
 * 
 * Minimalist design:
 * - Completed: Green background (color = status, no icons)
 * - Current: Primary with ● indicator
 * - Pending: Muted, subtle
 * - Auto steps: Italic, hollow border
 * 
 * Interactive:
 * - Completed/Current steps are clickable for navigation
 * - Hover effects indicate interactivity
 */

import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { UserActionStep, ActionType } from "@/config/userActionStepsConfig";

interface ActionBadgeStepperProps {
  steps: UserActionStep[];
  currentStepIndex: number;
  isCompleted?: boolean;
  className?: string;
  onStepClick?: (step: UserActionStep, index: number) => void;
}

type StepState = "completed" | "current" | "pending";

function getStepState(
  index: number, 
  currentStepIndex: number, 
  step: UserActionStep,
  isCompleted: boolean
): StepState {
  // If entire process is completed — all steps are completed
  if (isCompleted) return "completed";
  
  // Steps before current — completed
  if (index < currentStepIndex) return "completed";
  
  // Auto-steps at current position — completed (no user action needed)
  if (index === currentStepIndex && step.actor === "auto") {
    return "completed";
  }
  
  // Current step
  if (index === currentStepIndex) return "current";
  
  return "pending";
}

function getStepStyles(state: StepState, isAutoStep: boolean, isClickable: boolean): string {
  // Base clickable styles
  const clickableStyles = isClickable 
    ? "cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 focus:outline-none focus:ring-2 focus:ring-offset-1" 
    : "";
  
  // Auto steps have special styling
  if (isAutoStep && state === "pending") {
    return cn(
      "bg-transparent text-muted-foreground/50 border border-dashed border-border/40 italic",
      clickableStyles
    );
  }
  
  switch (state) {
    case "completed":
      return cn(
        "bg-emerald-100 text-emerald-700 border-emerald-200/50 font-medium",
        "dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/30",
        isClickable && "hover:ring-emerald-300 dark:hover:ring-emerald-700 focus:ring-emerald-400"
      );
    case "current":
      return cn(
        "bg-primary text-primary-foreground border-transparent font-medium",
        isClickable && "hover:ring-primary/50 focus:ring-primary"
      );
    case "pending":
      return "bg-muted/40 text-muted-foreground/60 border-transparent cursor-not-allowed";
  }
}

function getConnectorStyles(index: number, currentStepIndex: number): string {
  if (index < currentStepIndex) {
    return "bg-emerald-300 dark:bg-emerald-700";
  }
  return "bg-border/50";
}

// Tooltips for step navigation
const stepTooltips: Record<ActionType, Record<StepState, string>> = {
  fill: {
    completed: "Переглянути чернетку",
    current: "Редагувати документ",
    pending: "",
  },
  approve: {
    completed: "Переглянути погодження",
    current: "Перейти до погодження",
    pending: "",
  },
  sign: {
    completed: "Переглянути підпис",
    current: "Підписати документ",
    pending: "",
  },
  send: {
    completed: "Переглянути відправлення",
    current: "Відправити документ",
    pending: "",
  },
  done: {
    completed: "Документ завершено",
    current: "",
    pending: "",
  },
};

export const ActionBadgeStepper = ({
  steps,
  currentStepIndex,
  isCompleted = false,
  className,
  onStepClick,
}: ActionBadgeStepperProps) => {
  const currentStep = steps[currentStepIndex];
  
  const handleStepClick = (step: UserActionStep, index: number, state: StepState) => {
    // Only allow click on completed or current steps (not pending)
    if (state === "pending" || !onStepClick) return;
    // Don't trigger for "done" auto-step
    if (step.action === "done") return;
    onStepClick(step, index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, step: UserActionStep, index: number, state: StepState) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleStepClick(step, index, state);
    }
  };
  
  return (
    <div className={className}>
      {/* Desktop Layout (≥640px): Full badge chain */}
      <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
        {steps.map((step, index) => {
          const state = getStepState(index, currentStepIndex, step, isCompleted);
          const isAutoStep = step.actor === "auto";
          const label = state === "completed" ? step.completedLabel : step.actionLabel;
          const isClickable = onStepClick && state !== "pending" && step.action !== "done";
          const tooltip = stepTooltips[step.action]?.[state] || "";
          
          const badge = (
            <Badge 
              variant="status"
              className={cn(
                "text-xs px-2 py-0.5",
                getStepStyles(state, isAutoStep, !!isClickable)
              )}
              onClick={isClickable ? () => handleStepClick(step, index, state) : undefined}
              onKeyDown={isClickable ? (e) => handleKeyDown(e, step, index, state) : undefined}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-current={state === "current" ? "step" : undefined}
              aria-label={isClickable ? tooltip : undefined}
            >
              {state === "current" && (
                <span className="mr-1" aria-hidden="true">●</span>
              )}
              {label}
            </Badge>
          );
          
          return (
            <Fragment key={step.id}>
              {isClickable && tooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {badge}
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              ) : (
                badge
              )}
              
              {/* Connector line between badges */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "h-px w-3 flex-shrink-0 transition-colors",
                    getConnectorStyles(index, currentStepIndex)
                  )}
                  aria-hidden="true"
                />
              )}
            </Fragment>
          );
        })}
      </div>
      
      {/* Mobile Layout (<640px): Compact current action + progress */}
      <div className="sm:hidden flex items-center justify-between gap-2">
        {isCompleted ? (
          <Badge 
            variant="status"
            className={cn(
              "text-xs px-2 py-0.5",
              getStepStyles("completed", false, false)
            )}
          >
            {currentStep?.completedLabel || "Готово"}
          </Badge>
        ) : (
          <Badge 
            variant="status"
            className={cn(
              "text-xs px-2 py-0.5",
              getStepStyles("current", false, !!onStepClick && currentStep?.action !== "done")
            )}
            onClick={onStepClick && currentStep && currentStep.action !== "done" 
              ? () => handleStepClick(currentStep, currentStepIndex, "current") 
              : undefined}
            role={onStepClick && currentStep?.action !== "done" ? "button" : undefined}
            tabIndex={onStepClick && currentStep?.action !== "done" ? 0 : undefined}
            aria-current="step"
          >
            <span className="mr-1" aria-hidden="true">●</span>
            {currentStep?.actionLabel || "—"}
          </Badge>
        )}
        
        <span className="text-xs text-muted-foreground tabular-nums">
          {currentStepIndex + 1}/{steps.length}
        </span>
      </div>
    </div>
  );
};
