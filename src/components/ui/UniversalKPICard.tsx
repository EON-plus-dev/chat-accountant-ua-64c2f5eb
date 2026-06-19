import { ReactNode, useState, useCallback, useMemo } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Building2, User, Users, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/ui/Sparkline";
import { useIsMobile } from "@/hooks/use-mobile";

export interface BreakdownItem {
  id: string;
  label: string;
  value: string | number;
  percent?: number;
  onClick?: () => void;
  // Extended props from ExpandableKPICard
  icon?: LucideIcon;
  type?: string; // cabinet type for icon mapping
  ratioPercent?: number;
  details?: string;
}

export type KPIInteractionMode = "expand" | "navigate" | "scroll";

// Cabinet type icons mapping (migrated from ExpandableKPICard)
const typeIcons: Record<string, LucideIcon> = {
  fop: User,
  tov: Building2,
  individual: Users,
  "fop-group": Users,
};

export interface UniversalKPICardProps {
  // Core data
  title: string;
  value: string | number;
  format?: "currency" | "number" | "percent" | "days";
  description?: ReactNode;
  icon?: LucideIcon;
  trend?: { value: number; direction: "up" | "down" | "stable" };

  // Target/Goal comparison (NEW)
  target?: {
    value: number;
    label?: string; // "Ціль", "Ліміт", "План"
  };
  showProgressBar?: boolean; // default: true when target exists

  // Variants
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  /**
   * Visual density of the card.
   * - "comfortable" (default): Stripe-style full card with icon, description, inline expand.
   * - "compact": ~64px strip — icon becomes 8px dot + 16px inline glyph, description/sparkline/breakdown/expandedContent/aiPrompts collapse into a single info-Popover, trend renders as plain text, target progress is inline % unless ≥75%.
   * Note: when set, `density` overrides `size`. `size="sm"` without explicit `density` auto-promotes to compact.
   */
  density?: "compact" | "comfortable";
  /** Compact-only opt-in: keep description visible (use for context-critical KPIs like Investments unrealized P&L). */
  showDescription?: boolean;

  // Interactivity - NEW: interactionMode
  interactionMode?: KPIInteractionMode;
  onClick?: () => void;
  onNavigate?: () => void;
  navigateLabel?: string;
  scrollTargetId?: string; // NEW: target element ID for scroll mode
  onBeforeScroll?: () => void; // NEW: callback before scroll (e.g., switch tab)
  isActive?: boolean;

  // Expandable (only used when interactionMode === "expand")
  expandable?: boolean;
  defaultExpanded?: boolean;
  expandedContent?: ReactNode;

  // Details (for tooltip/popover)
  details?: { label: string; value: string }[];
  
  // Breakdown (for expandable list)
  breakdown?: BreakdownItem[];
  breakdownSheetThreshold?: number; // default: 10 - show Sheet when items > this
  breakdownMaxVisible?: number; // default: 3 - visible items before "show more"
  onBreakdownItemClick?: (id: string) => void;
  ratioLabel?: string; // e.g., "Tax Burden" or "Labor Cost"

  // Historical trend (sparkline)
  historicalData?: { month: string; value: number }[];

  // AI prompts
  aiPrompts?: string[];
  onAiPromptClick?: (prompt: string) => void;

  // Loading
  isLoading?: boolean;

  // Additional className
  className?: string;
}

// Stripe-style: neutral backgrounds with accent border indicators
const variantStyles = {
  default: {
    card: "border-border/70 bg-card",
    accent: "",
    icon: "bg-muted/50 text-muted-foreground",
    value: "text-foreground",
  },
  success: {
    card: "border-border/70 bg-card",
    accent: "border-l-4 border-l-emerald-500",
    icon: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    value: "text-foreground",
  },
  warning: {
    card: "border-border/70 bg-card",
    accent: "border-l-4 border-l-amber-500",
    icon: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    value: "text-foreground",
  },
  danger: {
    card: "border-border/70 bg-card",
    accent: "border-l-4 border-l-red-500",
    icon: "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400",
    value: "text-foreground",
  },
};

const sizeStyles = {
  sm: { card: "p-3", value: "text-xl", icon: "p-1.5 w-8 h-8" },
  md: { card: "p-4", value: "text-2xl", icon: "p-2 w-9 h-9" },
  lg: { card: "p-5", value: "text-3xl", icon: "p-2.5 w-10 h-10" },
};

// Compact-mode dot accent — visible in dark mode via ring
const compactDotByVariant: Record<NonNullable<UniversalKPICardProps["variant"]>, string> = {
  default: "bg-muted-foreground/40 ring-1 ring-muted-foreground/20",
  success: "bg-emerald-500 ring-1 ring-emerald-500/30",
  warning: "bg-amber-500 ring-1 ring-amber-500/30",
  danger: "bg-red-500 ring-1 ring-red-500/30",
};

// Compact-mode inline icon tone (no background tile, just colored 16px glyph)
const compactIconToneByVariant: Record<NonNullable<UniversalKPICardProps["variant"]>, string> = {
  default: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
};

export function UniversalKPICard({
  title,
  value,
  format = "number",
  description,
  icon: Icon,
  trend,
  target,
  showProgressBar,
  variant = "default",
  size = "md",
  density,
  showDescription,
  interactionMode,
  onClick,
  onNavigate,
  navigateLabel = "Детальніше",
  scrollTargetId,
  onBeforeScroll,
  isActive = false,
  expandable = false,
  defaultExpanded = false,
  expandedContent,
  details,
  breakdown,
  breakdownSheetThreshold = 10,
  breakdownMaxVisible = 3,
  onBreakdownItemClick,
  ratioLabel = "від доходу",
  historicalData,
  aiPrompts,
  onAiPromptClick,
  isLoading = false,
  className,
}: UniversalKPICardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isMobile = useIsMobile();

  // Density precedence: explicit `density` overrides `size`.
  // `size="sm"` without explicit density auto-promotes to compact (backward-compat shim).
  const actualDensity: "compact" | "comfortable" =
    density ?? (size === "sm" ? "compact" : "comfortable");
  const isCompact = actualDensity === "compact";

  // Determine actual interaction mode
  const actualMode: KPIInteractionMode | undefined = interactionMode 
    ?? (scrollTargetId ? "scroll" : expandable ? "expand" : onClick ? undefined : undefined);

  // Target/Goal progress calculation
  const progress = useMemo(() => {
    if (!target || typeof value !== "number") return 0;
    return (value / target.value) * 100;
  }, [value, target]);

  // Breakdown with Sheet mode
  const sortedBreakdown = useMemo(() => {
    if (!breakdown) return [];
    return [...breakdown].sort((a, b) => {
      const aVal = typeof a.value === "number" ? a.value : 0;
      const bVal = typeof b.value === "number" ? b.value : 0;
      return bVal - aVal;
    });
  }, [breakdown]);

  const visibleBreakdown = sortedBreakdown.slice(0, breakdownMaxVisible);
  const hasMoreBreakdown = sortedBreakdown.length > breakdownMaxVisible;
  const useSheetForBreakdown = sortedBreakdown.length > breakdownSheetThreshold;

  const formatValue = useCallback((val: string | number): string => {
    if (typeof val === "string") return val;
    
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("uk-UA", {
          style: "decimal",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val) + " ₴";
      case "percent":
        return val.toFixed(1) + "%";
      case "days":
        return val + " дн.";
      default:
        return val.toLocaleString("uk-UA");
    }
  }, [format]);

  const handleScrollToSection = useCallback(() => {
    if (scrollTargetId) {
      // Execute callback first (e.g., switch tab on mobile)
      onBeforeScroll?.();
      
      // Wait for DOM to update after potential tab switch
      setTimeout(() => {
        const element = document.getElementById(scrollTargetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          // Add highlight animation
          element.classList.add("ring-2", "ring-primary", "ring-offset-2");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
          }, 1500);
        }
      }, onBeforeScroll ? 150 : 0);
    }
  }, [scrollTargetId, onBeforeScroll]);

  const handleCardClick = useCallback(() => {
    if (actualMode === "scroll" && scrollTargetId) {
      handleScrollToSection();
    } else if (actualMode === "expand" || expandable) {
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick();
    }
  }, [actualMode, scrollTargetId, handleScrollToSection, expandable, isExpanded, onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  const hasExpandableContent = (actualMode === "expand" || expandable) && (expandedContent || breakdown || aiPrompts);
  const isScrollMode = actualMode === "scroll" && scrollTargetId;
  const isClickable = onClick || expandable || isScrollMode || onNavigate;
  
  // Always show info icon when details exist
  const showInfoTooltip = details && details.length > 0;

  // Skeleton state - matches final layout exactly for zero CLS
  if (isLoading) {
    if (isCompact) {
      // Compact skeleton: ~64px height matches compact render exactly
      return (
        <Card className={cn("h-full flex flex-col", className)}>
          <CardContent className="p-2.5 flex-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted shimmer shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="h-2.5 bg-muted rounded w-20 shimmer" />
              <div className="h-4 bg-muted rounded w-24 shimmer" />
            </div>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className={cn("h-full flex flex-col", className)}>
        <CardContent className={cn(sizes.card, "flex-1 flex flex-col")}>
          <div className="flex items-start justify-between gap-3 flex-1">
            <div className="flex-1 min-w-0 space-y-1">
              {/* Title skeleton */}
              <div className="flex items-center gap-1.5">
                <div className="h-3 bg-muted rounded w-20 shimmer" />
              </div>
              {/* Value skeleton */}
              <div className="flex items-baseline gap-2">
                <div className={cn(
                  "h-7 bg-muted rounded w-28 shimmer",
                  sizes.value === "text-xl" && "h-6",
                  sizes.value === "text-3xl" && "h-9"
                )} />
                <div className="h-5 bg-muted rounded w-12 shimmer" />
              </div>
              {/* Description skeleton */}
              <div className="min-h-[24px] flex items-center">
                <div className="h-3 bg-muted rounded w-32 shimmer" />
              </div>
            </div>
            {/* Icon skeleton */}
            <div className={cn("bg-muted rounded-lg shimmer", sizes.icon)} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================
  // COMPACT DENSITY RENDER (Stripe/Mercury 2025 strip pattern)
  // ============================================================
  // Auto-redirects description, sparkline, breakdown, expandedContent and
  // aiPrompts into a single info-Popover so the strip stays at ~64px height.
  // `showDescription` opt-in keeps the description inline (Investments use case).
  if (isCompact) {
    const dotTone = compactDotByVariant[variant];
    const iconTone = compactIconToneByVariant[variant];
    const showDescInline = showDescription === true && !!description;

    // Auto-redirected payload — anything that would break the 64px strip goes into the Popover.
    const popoverHasContent = Boolean(
      (description && !showDescInline) ||
        (details && details.length > 0) ||
        (historicalData && historicalData.length > 0) ||
        (breakdown && breakdown.length > 0) ||
        expandedContent ||
        (aiPrompts && aiPrompts.length > 0),
    );

    // Target progress: inline % when <75%, thin h-0.5 bar when ≥75% (warning/danger).
    const showInlineProgress =
      target && typeof value === "number" && showProgressBar !== false && progress < 75;
    const showCriticalProgressBar =
      target && typeof value === "number" && showProgressBar !== false && progress >= 75;

    const trendTone =
      trend?.direction === "up"
        ? "text-emerald-600 dark:text-emerald-400"
        : trend?.direction === "down"
          ? "text-red-600 dark:text-red-400"
          : "text-muted-foreground";

    const compactCard = (
      <Card
        className={cn(
          "group h-full flex flex-col transition-all duration-200 hover:shadow-sm",
          isClickable && "cursor-pointer hover:border-primary/30",
          isActive && "ring-2 ring-primary border-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "border-border/70 bg-card",
          className,
        )}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={isScrollMode ? `${title} - натисніть для переходу до деталей` : undefined}
      >
        <CardContent className="p-2.5 flex-1 flex flex-col gap-1">
          {/* Row 1: dot + (icon) + title + info */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              aria-hidden
              className={cn("w-2 h-2 rounded-full shrink-0", dotTone)}
            />
            {Icon && (
              <Icon className={cn("w-3.5 h-3.5 shrink-0", iconTone)} />
            )}
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium truncate flex-1 min-w-0">
              {title}
            </p>
            {popoverHasContent && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="relative text-muted-foreground/60 hover:text-muted-foreground transition-colors shrink-0 -m-2.5 p-2.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Деталі показника"
                  >
                    {/* Visible glyph 16px, tap area 44×44 via negative-margin padding */}
                    <Info className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-72 p-3 text-xs space-y-2"
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {description && !showDescInline && (
                    <div className="text-muted-foreground">{description}</div>
                  )}
                  {details && details.length > 0 && (
                    <div className="space-y-1.5">
                      {details.map((d, i) => (
                        <div key={i} className="flex justify-between gap-2">
                          <span className="text-muted-foreground">{d.label}</span>
                          <span className="font-medium text-right">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {historicalData && historicalData.length > 0 && (
                    <div className="pt-1 border-t border-border/50">
                      <div className="text-[10px] text-muted-foreground mb-1">
                        Останні {historicalData.length} міс.
                      </div>
                      <Sparkline
                        data={historicalData.map((h) => h.value)}
                        height={40}
                        strokeWidth={1.5}
                        color={
                          trend?.direction === "down"
                            ? "destructive"
                            : trend?.direction === "up"
                              ? "success"
                              : "primary"
                        }
                      />
                    </div>
                  )}
                  {breakdown && breakdown.length > 0 && (
                    <div className="pt-1 border-t border-border/50 space-y-0.5">
                      {sortedBreakdown.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 text-[11px]"
                        >
                          <span className="text-muted-foreground truncate">{item.label}</span>
                          <span className="font-medium tabular-nums shrink-0">
                            {typeof item.value === "number" ? formatValue(item.value) : item.value}
                          </span>
                        </div>
                      ))}
                      {sortedBreakdown.length > 5 && (
                        <div className="text-[10px] text-muted-foreground pt-1">
                          + ще {sortedBreakdown.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                  {expandedContent && (
                    <div className="pt-1 border-t border-border/50">{expandedContent}</div>
                  )}
                  {aiPrompts && aiPrompts.length > 0 && onAiPromptClick && (
                    <div className="pt-1 border-t border-border/50 flex flex-wrap gap-1.5">
                      {aiPrompts.map((p, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAiPromptClick(p);
                          }}
                          className="text-[11px] px-2 py-1 rounded border border-border hover:bg-muted transition-colors"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Row 2: value + trend (plain text) + inline progress % */}
          <div className="flex items-baseline gap-2 min-w-0">
            <p className="font-bold tabular-nums tracking-tight text-lg text-foreground truncate">
              {formatValue(value)}
            </p>
            {trend && (
              <span className={cn("text-xs font-medium tabular-nums shrink-0", trendTone)}>
                {trend.direction === "up" && "↑"}
                {trend.direction === "down" && "↓"}
                {trend.direction === "stable" && "→"}
                {Math.abs(trend.value)}%
              </span>
            )}
            {showInlineProgress && (
              <span className="text-[11px] text-muted-foreground tabular-nums shrink-0 ml-auto">
                {progress.toFixed(0)}% {target!.label || "від цілі"}
              </span>
            )}
          </div>

          {/* Optional inline description (opt-in via showDescription) */}
          {showDescInline && (
            <div className="text-[11px] text-muted-foreground truncate">{description}</div>
          )}

          {/* Critical progress bar — only when ≥75% (height +4px) */}
          {showCriticalProgressBar && (
            <div className="h-0.5 w-full bg-muted rounded-full overflow-hidden mt-0.5">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progress >= 100 ? "bg-emerald-500" : progress >= 90 ? "bg-red-500" : "bg-amber-500",
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );

    return compactCard;
  }

  const cardContent = (
    <CardContent className={cn(sizes.card, "flex-1 flex flex-col")}>

      <div className="flex items-start justify-between gap-3 flex-1">
        <div className="flex-1 min-w-0 space-y-1">
          {/* Title with info icon */}
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground font-medium truncate">
              {title}
            </p>
            {showInfoTooltip && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground/60 hover:text-muted-foreground transition-colors shrink-0 p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Деталі показника"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3 text-xs space-y-1.5" align="start" onClick={(e) => e.stopPropagation()}>
                  {details!.map((d, i) => (
                    <div key={i} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-medium text-right">{d.value}</span>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Value with trend */}
          <div className="flex items-baseline gap-2">
            <p className={cn("font-bold tabular-nums tracking-tight", sizes.value, styles.value)}>
              {formatValue(value)}
            </p>
            {trend && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] px-1.5 py-0 h-5",
                  trend.direction === "up" && "text-emerald-600 dark:text-emerald-400",
                  trend.direction === "down" && "text-red-600 dark:text-red-400",
                  trend.direction === "stable" && "text-muted-foreground"
                )}
              >
                {trend.direction === "up" && "↑"}
                {trend.direction === "down" && "↓"}
                {trend.direction === "stable" && "→"}
                {Math.abs(trend.value)}%
              </Badge>
            )}
          </div>

          {/* Target Progress Bar - compact, Stripe-style */}
          {target && typeof value === "number" && (showProgressBar !== false) && (
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    progress >= 100 ? "bg-emerald-500" :
                    progress >= 75 ? "bg-primary" :
                    progress >= 50 ? "bg-amber-500" :
                    "bg-red-500"
                  )}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                <span className="truncate mr-2">{progress.toFixed(0)}% {target.label || "від цілі"}</span>
                <span className="tabular-nums shrink-0">{formatValue(target.value)}</span>
              </div>
            </div>
          )}

          {/* Description & navigate - fixed slot height */}
          <div className="flex items-center gap-2 flex-wrap min-h-[24px] mt-auto">
            {description && (
              <div className="text-xs text-muted-foreground truncate max-w-full">
                {description}
              </div>
            )}
            {onNavigate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate();
                }}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 min-h-[36px] min-w-[36px] md:min-h-[32px] md:min-w-[32px] px-2 -mx-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={navigateLabel}
              >
                {navigateLabel}
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Icon and expand indicator - simplified, no scroll arrow */}
        <div className="flex flex-col items-end gap-1.5">
          {Icon && (
            <div className={cn("rounded-lg flex items-center justify-center", sizes.icon, styles.icon)}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          {/* Expand mode indicator only */}
          {hasExpandableContent && (
            <ChevronDown 
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-180"
              )} 
            />
          )}
        </div>
      </div>

      {/* Sparkline - adaptive height for mobile */}
      {historicalData && historicalData.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground">Останні 6 місяців</span>
            <Sparkline 
              data={historicalData.map(h => h.value)} 
              height={isMobile ? 48 : 32}
              strokeWidth={isMobile ? 2.5 : 1.5}
              color={trend?.direction === "down" ? "destructive" : trend?.direction === "up" ? "success" : "primary"}
            />
          </div>
        </div>
      )}
    </CardContent>
  );

  const renderBreakdownItem = (item: BreakdownItem) => {
    const ItemIcon = item.icon || (item.type ? typeIcons[item.type] : undefined) || Building2;
    
    return (
      <button
        key={item.id}
        onClick={(e) => {
          e.stopPropagation();
          if (item.onClick) {
            item.onClick();
          } else if (onBreakdownItemClick) {
            onBreakdownItemClick(item.id);
          }
        }}
        className={cn(
          "w-full flex items-center gap-2 p-2 rounded-md text-sm",
          "hover:bg-muted/50 transition-colors text-left group/item",
          "min-h-[44px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        {/* Icon for cabinet type */}
        {(item.icon || item.type) && (
          <div className="p-1 rounded bg-muted shrink-0">
            <ItemIcon className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
        
        <span className="flex-1 min-w-0 text-muted-foreground truncate group-hover/item:text-foreground transition-colors">
          {item.label}
        </span>
        
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-medium tabular-nums">
            {typeof item.value === "number" ? formatValue(item.value) : item.value}
          </span>
          {item.percent !== undefined && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
              {item.percent.toFixed(1)}%
            </Badge>
          )}
          {item.ratioPercent !== undefined && (
            <span className={cn(
              "text-[10px] tabular-nums w-10 text-right",
              item.ratioPercent < 7 ? "text-emerald-600 dark:text-emerald-400" :
              item.ratioPercent < 15 ? "text-amber-600 dark:text-amber-400" :
              "text-red-600 dark:text-red-400"
            )}>
              {item.ratioPercent.toFixed(1)}%
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
        </div>
      </button>
    );
  };

  const expandedSection = hasExpandableContent && (
    <CollapsibleContent className="will-change-[height,opacity]">
      <div className="px-4 pb-4 space-y-3">
        <div className="border-t border-border/50 pt-3" />
        
        {/* Custom expanded content */}
        {expandedContent}
        
        {/* Breakdown list with Sheet mode for large lists */}
        {sortedBreakdown.length > 0 && (
          <div className="space-y-1">
            {/* Show visible items */}
            {visibleBreakdown.map(renderBreakdownItem)}
            
            {/* Show more button - Sheet or inline expand */}
            {hasMoreBreakdown && (
              useSheetForBreakdown ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full h-8 text-xs mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Показати всі ({sortedBreakdown.length})
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        {title}
                        <Badge variant="outline">{sortedBreakdown.length}</Badge>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      {/* Header row */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b mb-2 px-1">
                        <span>Елемент</span>
                        <div className="flex items-center gap-4">
                          <span>Сума</span>
                          <span className="w-10 text-center">%</span>
                          {sortedBreakdown.some(c => c.ratioPercent !== undefined) && (
                            <span className="w-12 text-center">{ratioLabel}</span>
                          )}
                        </div>
                      </div>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-0.5 p-1">
                          {sortedBreakdown.map(renderBreakdownItem)}
                        </div>
                      </ScrollArea>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-8 text-xs mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Show all items inline by re-rendering (handled by state if needed)
                  }}
                >
                  + ще {sortedBreakdown.length - breakdownMaxVisible}
                </Button>
              )
            )}
          </div>
        )}
        
        {/* AI prompts */}
        {aiPrompts && aiPrompts.length > 0 && onAiPromptClick && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Запитайте AI:</p>
            <div className="flex flex-wrap gap-2">
              {aiPrompts.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs min-h-[44px] px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAiPromptClick(prompt);
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleContent>
  );

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card
        className={cn(
          "group h-full flex flex-col", // Stretch in grid containers + group for hover states
          "transition-all duration-200",
          "hover:shadow-sm", // Subtle shadow on hover
          isClickable && "cursor-pointer hover:border-primary/30", // Less aggressive border
          isActive && "ring-2 ring-primary border-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          styles.card,
          styles.accent, // Border-left accent indicator
          className
        )}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-expanded={hasExpandableContent ? isExpanded : undefined}
        aria-label={isScrollMode ? `${title} - натисніть для переходу до деталей` : undefined}
      >
        {hasExpandableContent ? (
          <CollapsibleTrigger asChild>
            <div>{cardContent}</div>
          </CollapsibleTrigger>
        ) : (
          cardContent
        )}
        {expandedSection}
      </Card>
    </Collapsible>
  );
}
