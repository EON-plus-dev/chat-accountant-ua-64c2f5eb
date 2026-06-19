import { useState, useEffect } from "react";
import { X, Sparkles, Lock, Award, Users, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NudgeTrigger = 
  | "feature_locked" 
  | "milestone" 
  | "time_based" 
  | "partner_action"
  | "inactivity";

interface NudgeTemplate {
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

const nudgeStyles: Record<NudgeTrigger, NudgeTemplate> = {
  feature_locked: {
    icon: Lock,
    iconColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  },
  milestone: {
    icon: Award,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
  },
  time_based: {
    icon: Sparkles,
    iconColor: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800",
  },
  partner_action: {
    icon: Users,
    iconColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
  },
  inactivity: {
    icon: Sparkles,
    iconColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
  },
};

interface ContextualNudgeProps {
  trigger: NudgeTrigger;
  title: string;
  description?: string;
  ctaLabel: string;
  ctaAction: () => void;
  onDismiss?: () => void;
  dismissable?: boolean;
  className?: string;
  data?: Record<string, unknown>;
}

export const ContextualNudge = ({
  trigger,
  title,
  description,
  ctaLabel,
  ctaAction,
  onDismiss,
  dismissable = true,
  className,
}: ContextualNudgeProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const style = nudgeStyles[trigger];
  const Icon = style.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <Card className={cn("border", style.bgColor, className)}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="p-2 rounded-lg bg-background/80 shrink-0">
            <Icon className={cn("h-4 w-4", style.iconColor)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-sm font-medium">{title}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            
            {/* CTA */}
            <Button 
              size="sm" 
              variant="secondary"
              className="h-7 text-xs gap-1"
              onClick={ctaAction}
            >
              {ctaLabel}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>

          {/* Dismiss */}
          {dismissable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Pre-defined nudge configurations for common scenarios
export const nudgeTemplates = {
  featureLocked: (featureName: string, planRequired: string, onAction: () => void) => ({
    trigger: "feature_locked" as NudgeTrigger,
    title: `Функція "${featureName}" доступна на плані ${planRequired}`,
    description: "Розблокуйте повний функціонал для вашого бізнесу",
    ctaLabel: "Дізнатися більше",
    ctaAction: onAction,
  }),
  
  milestone5Docs: (onAction: () => void) => ({
    trigger: "milestone" as NudgeTrigger,
    title: "🎉 Ви підписали 5 документів!",
    description: "А чи знаєте, що можете створювати власні документи?",
    ctaLabel: "Спробувати",
    ctaAction: onAction,
  }),
  
  day30Passive: (onAction: () => void) => ({
    trigger: "time_based" as NudgeTrigger,
    title: "Ви з нами вже місяць!",
    description: "Час відкрити повний потенціал системи",
    ctaLabel: "Активувати пробний період",
    ctaAction: onAction,
  }),
  
  partnerUpgraded: (partnerName: string, newPlan: string, onAction: () => void) => ({
    trigger: "partner_action" as NudgeTrigger,
    title: `${partnerName} перейшов на план ${newPlan}`,
    description: "Приєднуйтесь з вигодою для обох сторін",
    ctaLabel: "Переглянути пропозицію",
    ctaAction: onAction,
  }),
};

export default ContextualNudge;
