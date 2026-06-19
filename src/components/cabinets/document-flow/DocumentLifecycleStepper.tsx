/**
 * ============================================
 * DOCUMENT LIFECYCLE STEPPER (v2.1 — Minimalist)
 * ============================================
 * 
 * Візуальний індикатор життєвого циклу документа.
 * 
 * Стадії (6 основних):
 * Чернетка → На узгодженні → Очікує підпису → Підписано → В обліку → Архів
 * 
 * Адаптивність:
 * - Desktop (≥640px): Connected horizontal stepper з іконками та labels
 * - Tablet (480-640px): Icons only + current label below
 * - Mobile (<480px): Flat inline з dot indicators
 * 
 * Мінімалістичні принципи:
 * - Flat design — без тіней, pulse, ring-offset
 * - Solid borders замість dashed
 * - Інтегрований mobile layout (без nested cards)
 * 
 * Data-атрибути для чат-оркестратора:
 * - data-section="document-lifecycle"
 * - data-step="completed" | "current" | "pending"
 * ============================================
 */

import React from "react";
import { cn } from "@/lib/utils";
import { type DocumentFlowStatus } from "@/config/documentFlowConfig";
import { 
  Check, 
  FileEdit, 
  Users, 
  PenLine, 
  FileCheck, 
  Calculator, 
  Archive,
  XCircle,
  AlertTriangle,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentLifecycleStepperProps {
  status: DocumentFlowStatus;
  className?: string;
}

// ============================================
// LIFECYCLE STAGES CONFIGURATION
// ============================================

const lifecycleSteps = [
  { 
    id: 0, 
    statuses: ["draft", "draft-pending-contractor"], 
    label: "Чернетка", 
    shortLabel: "Чернетка",
    icon: FileEdit 
  },
  { 
    id: 1, 
    statuses: ["needs-clarification", "in-review"], 
    label: "На узгодженні", 
    shortLabel: "Узгодження",
    icon: Users 
  },
  { 
    id: 2, 
    statuses: ["pending-sign"], 
    label: "Очікує підпису", 
    shortLabel: "Підпис",
    icon: PenLine 
  },
  { 
    id: 3, 
    statuses: ["signed", "sent"], 
    label: "Підписано", 
    shortLabel: "Підписано",
    icon: FileCheck 
  },
  { 
    id: 4, 
    statuses: ["confirmed", "paid", "partially-paid", "registered"], 
    label: "В обліку", 
    shortLabel: "Облік",
    icon: Calculator 
  },
  { 
    id: 5, 
    statuses: ["archived"], 
    label: "Архів", 
    shortLabel: "Архів",
    icon: Archive 
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStepFromStatus(status: DocumentFlowStatus): number {
  const stepIndex = lifecycleSteps.findIndex(step => step.statuses.includes(status));
  return stepIndex >= 0 ? stepIndex : 0;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const DocumentLifecycleStepper = ({ status, className }: DocumentLifecycleStepperProps) => {
  const currentStep = getStepFromStatus(status);
  const isCancelled = status === "cancelled";
  const isDisputed = status === "disputed" || status === "discrepancy-pending";
  const isArchived = status === "archived";
  const isPendingContractor = status === "draft-pending-contractor";
  
  const currentStepData = lifecycleSteps[currentStep];

  // ============================================
  // SPECIAL STATUS HANDLERS
  // ============================================

  // Pending contractor - special amber badge
  if (isPendingContractor) {
    return (
      <Badge 
        className="gap-1.5 h-7 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
        data-section="document-lifecycle"
        data-step="special"
      >
        <Clock className="w-3.5 h-3.5" />
        Очікує контрагента
      </Badge>
    );
  }

  if (isCancelled) {
    return (
      <Badge 
        variant="destructive" 
        className="gap-1.5 h-7"
        data-section="document-lifecycle"
        data-step="special"
      >
        <XCircle className="w-3.5 h-3.5" />
        Скасовано
      </Badge>
    );
  }

  if (isDisputed) {
    return (
      <Badge 
        className="gap-1.5 h-7 bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800"
        data-section="document-lifecycle"
        data-step="special"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Спір / Акт розбіжностей
      </Badge>
    );
  }

  return (
    <div 
      className={cn("flex flex-col", className)}
      data-section="document-lifecycle"
    >
      {/* ============================================
          DESKTOP: Connected horizontal stepper (≥640px)
          ============================================ */}
      <div className="hidden sm:flex items-start w-full">
        <TooltipProvider delayDuration={300}>
          {lifecycleSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;
            const StepIcon = step.icon;
            
            return (
              <React.Fragment key={step.id}>
                {/* Step column */}
                <div className="flex flex-col items-center gap-1.5 min-w-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200",
                          isCompleted && "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
                          isCurrent && "bg-primary text-primary-foreground",
                          isPending && "bg-background text-muted-foreground/60 border border-border/50"
                        )}
                        data-step={isCompleted ? "completed" : isCurrent ? "current" : "pending"}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {step.label}
                    </TooltipContent>
                  </Tooltip>
                  
                  {/* Label - hidden on smaller desktops, visible on lg+ */}
                  <span className={cn(
                    "text-[11px] font-medium text-center leading-tight hidden lg:block",
                    "max-w-[70px] truncate",
                    isCompleted && "text-emerald-600 dark:text-emerald-400",
                    isCurrent && "text-primary font-semibold",
                    isPending && "text-muted-foreground"
                  )}>
                    {step.shortLabel}
                  </span>
                </div>
                
                {/* Connector line */}
                {index < lifecycleSteps.length - 1 && (
                  <div className="flex-1 flex items-center h-8 min-w-[16px] max-w-[40px]">
                    <div 
                      className={cn(
                        "w-full h-0.5 transition-colors duration-300",
                        index < currentStep 
                          ? "bg-emerald-400 dark:bg-emerald-600" 
                          : "bg-border/50"
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </TooltipProvider>
      </div>

      {/* ============================================
          TABLET: Icons only with current label (480-640px)
          ============================================ */}
      <div className="hidden xs:flex sm:hidden flex-col items-center gap-2">
        {/* Icons row */}
        <div className="flex items-center w-full justify-center">
          {lifecycleSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;
            const StepIcon = step.icon;
            
            return (
              <React.Fragment key={step.id}>
                <div 
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200",
                    isCompleted && "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
                    isCurrent && "bg-primary text-primary-foreground",
                    isPending && "bg-background text-muted-foreground/60 border border-border/50"
                  )}
                  data-step={isCompleted ? "completed" : isCurrent ? "current" : "pending"}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <StepIcon className="w-3 h-3" />
                  )}
                </div>
                
                {/* Connector */}
                {index < lifecycleSteps.length - 1 && (
                  <div 
                    className={cn(
                      "w-3 xs:w-4 h-0.5 transition-colors duration-300",
                      index < currentStep 
                        ? "bg-emerald-400 dark:bg-emerald-600" 
                        : "bg-border/50"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Current step badge */}
        <Badge 
          variant="secondary" 
          className={cn(
            "gap-1.5 h-6 font-medium",
            isArchived && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          )}
        >
          {React.createElement(currentStepData.icon, { className: "w-3.5 h-3.5" })}
          {currentStepData.label}
        </Badge>
      </div>

      {/* ============================================
          MOBILE: Flat inline with dot indicators (<480px)
          ============================================ */}
      <div className="xs:hidden flex items-center justify-between gap-3" data-section="document-lifecycle-mobile">
        {/* Current step: icon + label */}
        <div className="flex items-center gap-2 min-w-0">
          <div 
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
              isArchived 
                ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                : "bg-primary text-primary-foreground"
            )}
          >
            {React.createElement(currentStepData.icon, { className: "w-3.5 h-3.5" })}
          </div>
          <span className="text-sm font-medium truncate">{currentStepData.label}</span>
        </div>
        
        {/* Dot indicators + counter */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex gap-1">
            {lifecycleSteps.map((_, index) => (
              <div 
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors duration-200",
                  index < currentStep && "bg-emerald-500 dark:bg-emerald-400",
                  index === currentStep && (isArchived ? "bg-slate-400" : "bg-primary"),
                  index > currentStep && "bg-border"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {currentStep + 1}/{lifecycleSteps.length}
          </span>
        </div>
      </div>
    </div>
  );
};