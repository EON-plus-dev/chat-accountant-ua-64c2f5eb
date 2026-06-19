/**
 * TemplateBadges - Functional metadata badges for templates
 * Priority-based rendering: Tax → AI → Features (max 3 visible)
 * Enterprise-level pattern matching Stripe/DocuSign standards
 */

import { Sparkles, Receipt, FileText, PenLine, CalendarDays, Paperclip, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TaxType, TemplateFeature, ComplianceTag } from "@/config/documentTemplatesConfig";

interface TemplateBadgesProps {
  taxType?: TaxType;
  features?: TemplateFeature[];
  compliance?: ComplianceTag[];
  isRecommended?: boolean;
  matchedTags?: string[];
  isCustom?: boolean;
  maxVisible?: number;
  size?: "sm" | "default";
}

interface BadgeConfig {
  label: string;
  variant: "success" | "info" | "warning" | "secondary" | "outline";
  icon?: React.ReactNode;
  priority: number;
}

const FEATURE_BADGES: Record<TemplateFeature, BadgeConfig> = {
  positions: { 
    label: "Позиції", 
    variant: "info", 
    icon: <FileText className="w-2.5 h-2.5" />,
    priority: 10 
  },
  discount: { 
    label: "Знижка", 
    variant: "warning", 
    icon: <Receipt className="w-2.5 h-2.5" />,
    priority: 20 
  },
  signature: { 
    label: "Підпис", 
    variant: "secondary", 
    icon: <PenLine className="w-2.5 h-2.5" />,
    priority: 30 
  },
  schedule: { 
    label: "Графік", 
    variant: "info", 
    icon: <CalendarDays className="w-2.5 h-2.5" />,
    priority: 40 
  },
  notes: { 
    label: "Коментар", 
    variant: "outline", 
    priority: 50 
  },
  appendix: { 
    label: "Додатки", 
    variant: "outline", 
    icon: <Paperclip className="w-2.5 h-2.5" />,
    priority: 60 
  },
};

const VARIANT_CLASSES: Record<string, string> = {
  success: "bg-success/10 text-success-foreground border-success/20",
  info: "bg-info/10 text-info-foreground border-info/20",
  warning: "bg-warning/10 text-warning-foreground border-warning/20",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border-border bg-transparent",
};

export function TemplateBadges({
  taxType,
  features = [],
  compliance = [],
  isRecommended = false,
  matchedTags = [],
  isCustom = false,
  maxVisible = 3,
  size = "sm",
}: TemplateBadgesProps) {
  // Build badges in priority order
  const badges: Array<{ key: string; label: string; variant: string; icon?: React.ReactNode; tooltip?: string }> = [];

  // 1. Tax badge (highest priority)
  if (taxType === "vat") {
    badges.push({ 
      key: "tax-vat", 
      label: "ПДВ", 
      variant: "success",
      tooltip: "Шаблон з урахуванням ПДВ"
    });
  } else if (taxType === "no-vat") {
    badges.push({ 
      key: "tax-no-vat", 
      label: "Без ПДВ", 
      variant: "outline",
      tooltip: "Шаблон без ПДВ"
    });
  }

  // 2. AI recommendation badge
  if (isRecommended) {
    badges.push({ 
      key: "ai-recommended", 
      label: "AI", 
      variant: "primary",
      icon: <Sparkles className="w-2.5 h-2.5" />,
      tooltip: matchedTags.length > 0 
        ? `Відповідає: ${matchedTags.join(", ")}` 
        : "Рекомендовано AI на основі запиту"
    });
  }

  // 3. Custom template badge
  if (isCustom) {
    badges.push({ 
      key: "custom", 
      label: "Мій", 
      variant: "outline",
      tooltip: "Власний шаблон"
    });
  }

  // 4. Compliance badges
  compliance.forEach((tag) => {
    if (tag === "legal-verified") {
      badges.push({ 
        key: `compliance-${tag}`, 
        label: "Перевірено", 
        variant: "success",
        icon: <Shield className="w-2.5 h-2.5" />,
        tooltip: "Юридично перевірений шаблон"
      });
    }
  });

  // 5. Feature badges (sorted by priority)
  const sortedFeatures = [...features].sort((a, b) => 
    (FEATURE_BADGES[a]?.priority || 100) - (FEATURE_BADGES[b]?.priority || 100)
  );
  
  sortedFeatures.forEach((feature) => {
    const config = FEATURE_BADGES[feature];
    if (config) {
      badges.push({ 
        key: `feature-${feature}`, 
        label: config.label, 
        variant: config.variant,
        icon: config.icon,
        tooltip: getFeatureTooltip(feature)
      });
    }
  });

  // Split into visible and overflow
  const visibleBadges = badges.slice(0, maxVisible);
  const overflowBadges = badges.slice(maxVisible);
  const hasOverflow = overflowBadges.length > 0;

  const sizeClasses = size === "sm" 
    ? "text-[9px] h-4 px-1.5 py-0" 
    : "text-[10px] h-5 px-2 py-0.5";

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 flex-wrap">
        {visibleBadges.map((badge) => (
          <Tooltip key={badge.key}>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline"
                className={cn(
                  sizeClasses,
                  "cursor-help shrink-0 gap-0.5",
                  badge.variant === "primary" 
                    ? "bg-primary/10 text-primary border-primary/20" 
                    : VARIANT_CLASSES[badge.variant] || VARIANT_CLASSES.outline
                )}
              >
                {badge.icon}
                {badge.label}
              </Badge>
            </TooltipTrigger>
            {badge.tooltip && (
              <TooltipContent side="top" className="text-xs max-w-[200px]">
                {badge.tooltip}
              </TooltipContent>
            )}
          </Tooltip>
        ))}
        
        {hasOverflow && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={cn(sizeClasses, "cursor-help shrink-0")}
              >
                +{overflowBadges.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <div className="space-y-1">
                {overflowBadges.map((badge) => (
                  <div key={badge.key} className="flex items-center gap-1">
                    {badge.icon}
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

function getFeatureTooltip(feature: TemplateFeature): string {
  switch (feature) {
    case "positions": return "Таблиця позицій товарів/послуг";
    case "discount": return "Поле для знижки";
    case "signature": return "Місце для підпису";
    case "schedule": return "Графік платежів";
    case "notes": return "Поле для коментарів";
    case "appendix": return "Додатки до документу";
    default: return "";
  }
}
