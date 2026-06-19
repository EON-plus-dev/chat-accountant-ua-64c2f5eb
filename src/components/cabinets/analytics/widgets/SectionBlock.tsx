import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface SeverityChip {
  label: string;
  count: number;
  variant: "error" | "warning" | "outline";
  filterId?: string; // e.g. "critical", "warning", "info" — for clickable filtering
}

export interface FilterChip {
  id: string;
  label: string;
  count: number;
}

export interface SortOption {
  id: string;
  label: string;
}

interface SectionBlockProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  count?: number;
  severityChips?: SeverityChip[];
  filterChips?: FilterChip[];
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  fixedHeight?: string;
  showAllLabel?: string;
  onShowAll?: () => void;
  sortOptions?: SortOption[];
  activeSort?: string;
  onSortChange?: (id: string) => void;
  onSeverityClick?: (filterId: string) => void;
  children: React.ReactNode;
  className?: string;
}

const severityVariantMap: Record<SeverityChip["variant"], string> = {
  error: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  outline: "bg-muted text-muted-foreground border-border",
};

export const SectionBlock = ({
  title,
  subtitle,
  icon: Icon,
  count,
  severityChips,
  filterChips,
  activeFilter,
  onFilterChange,
  fixedHeight,
  showAllLabel,
  onShowAll,
  sortOptions,
  activeSort,
  onSortChange,
  onSeverityClick,
  children,
  className,
}: SectionBlockProps) => {
  return (
    <Card className={cn("border-border/70 overflow-hidden", className)}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 space-y-2">
          {/* Row 1: icon + title + count + severity chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {Icon && <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            <span className="text-sm font-semibold text-foreground">{title}</span>
            {count !== undefined && count > 0 && (
              <Badge variant="secondary" size="sm" className="text-xs font-mono tabular-nums">
                {count}
              </Badge>
            )}
            {severityChips && severityChips.length > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                {severityChips.filter(c => c.count > 0).map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => chip.filterId && onSeverityClick?.(chip.filterId)}
                    className={cn(
                      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors",
                      severityVariantMap[chip.variant],
                      chip.filterId && onSeverityClick && "cursor-pointer hover:opacity-80"
                    )}
                  >
                    {chip.label} {chip.count}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}

          {/* Filter chips row */}
          {filterChips && filterChips.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1">
              {filterChips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => onFilterChange?.(chip.id)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border transition-colors whitespace-nowrap min-h-[28px]",
                    activeFilter === chip.id
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
                  )}
                >
                  {chip.label}
                  <span className="text-[10px] opacity-70">({chip.count})</span>
                </button>
              ))}
            </div>
          )}

          {/* Sort options */}
          {sortOptions && sortOptions.length > 0 && (
            <div className="flex items-center gap-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSortChange?.(opt.id)}
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded transition-colors",
                    activeSort === opt.id
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content area with optional fixed height + scroll + fade */}
        {fixedHeight ? (
          <div className="relative" style={{ height: fixedHeight }}>
            <ScrollArea className="h-full" scrollbarVariant="thin">
              <div className="px-4 pb-2">
                {children}
              </div>
            </ScrollArea>
            {/* Fade gradient at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
              style={{
                background: "linear-gradient(to top, hsl(var(--card)) 0%, transparent 100%)",
              }}
            />
          </div>
        ) : (
          <div className="px-4 pb-2">
            {children}
          </div>
        )}

        {/* Footer: show all */}
        {showAllLabel && onShowAll && (
          <div className="px-4 pb-3 pt-1 border-t border-border/40">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-8 text-primary"
              onClick={onShowAll}
            >
              {showAllLabel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
