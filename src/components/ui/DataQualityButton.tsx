import { Check, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { getBadgeColorClasses } from "@/config/semanticStyles";
import { useState } from "react";

// ============================================
// TYPES
// ============================================

export interface IssueTypeDefinition {
  label: string;
  shortLabel: string;
  color: string; // amber, orange, red, yellow, blue, purple, slate
  priority: number;
}

export interface DataQualitySummary {
  qualityPercent: number;
  totalCount: number;
  itemsWithIssues: number;
  issuesByType: Record<string, number>;
}

export interface DataQualityButtonProps {
  summary: DataQualitySummary;
  issueTypeConfig: Record<string, IssueTypeDefinition>;
  onShowAllIssues: () => void;
  onFilterByIssueType: (issueType: string) => void;
  isMobile?: boolean;
  itemLabel?: string; // "документів" | "операцій"
  /** Optional extra content rendered between stats and Issues breakdown (e.g. categorization chip). */
  extraSection?: React.ReactNode;
}

// ============================================
// QUALITY COLOR HELPER
// ============================================

const getQualityColorClasses = (percent: number) => {
  if (percent >= 90) {
    return {
      text: "text-emerald-600",
      progress: "[&>div]:bg-emerald-500",
      buttonText: "text-emerald-600 hover:text-emerald-700",
    };
  }
  if (percent >= 70) {
    return {
      text: "text-amber-600",
      progress: "[&>div]:bg-amber-500",
      buttonText: "text-amber-600 hover:text-amber-700",
    };
  }
  return {
    text: "text-red-600",
    progress: "[&>div]:bg-red-500",
    buttonText: "text-red-600 hover:text-red-700",
  };
};

// ============================================
// COMPONENT
// ============================================

export const DataQualityButton = ({
  summary,
  issueTypeConfig,
  onShowAllIssues,
  onFilterByIssueType,
  isMobile,
  itemLabel = "записів",
  extraSection,
}: DataQualityButtonProps) => {
  const [open, setOpen] = useState(false);
  const { qualityPercent, itemsWithIssues, totalCount, issuesByType } = summary;
  
  const isGood = qualityPercent >= 90;
  const colors = getQualityColorClasses(qualityPercent);
  
  // Transform issuesByType to sorted array with config
  const issuesWithConfig = Object.entries(issuesByType)
    .map(([type, count]) => {
      const config = issueTypeConfig[type];
      if (!config) return null;
      return {
        type,
        count: count || 0,
        label: config.shortLabel,
        color: config.color,
        priority: config.priority ?? 99,
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null && i.count > 0)
    .sort((a, b) => a.priority - b.priority);

  const handleIssueClick = (issueType: string) => {
    setOpen(false);
    // Small delay to allow popover/drawer to close smoothly
    setTimeout(() => {
      onFilterByIssueType(issueType);
    }, 150);
  };

  const handleShowAll = () => {
    setOpen(false);
    setTimeout(() => {
      onShowAllIssues();
    }, 150);
  };
  
  // ============================================
  // CONTENT (shared between Popover and Drawer)
  // ============================================
  
  const Content = ({ showHeader = true }: { showHeader?: boolean }) => (
    <div className="space-y-4">
      {/* Header with percentage */}
      {showHeader ? (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Відповідність</span>
          <span className={cn("text-2xl font-bold tabular-nums", colors.text)}>
            {qualityPercent}%
          </span>
        </div>
      ) : (
        <div className="flex justify-end">
          <span className={cn("text-2xl font-bold tabular-nums", colors.text)}>
            {qualityPercent}%
          </span>
        </div>
      )}
      
      {/* Progress bar */}
      <Progress 
        value={qualityPercent} 
        className={cn("h-2", colors.progress)} 
      />
      
      {/* Stats */}
      <p className="text-sm text-muted-foreground">
        {totalCount - itemsWithIssues} з {totalCount} {itemLabel} коректні
      </p>

      {/* Optional extra section (e.g. categorization chip) */}
      {extraSection && (
        <>
          <Separator />
          {extraSection}
        </>
      )}
      
      {/* Issues breakdown - clickable rows */}
      {itemsWithIssues > 0 && issuesWithConfig.length > 0 && (
        <>
          <Separator />
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Проблеми
            </span>
          {(() => {
              const issuesList = (
                <div className={cn("space-y-0.5", !isMobile && "pr-3")}>
                  {issuesWithConfig.map((issue) => (
                    <div
                      key={issue.type}
                      role="button"
                      tabIndex={0}
                      aria-label={`Фільтрувати по: ${issue.label}, кількість: ${issue.count}`}
                      className="flex items-center justify-between text-sm py-1.5 px-2 -mx-1 rounded-sm cursor-pointer transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground active:scale-[0.98]"
                      onClick={() => handleIssueClick(issue.type)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleIssueClick(issue.type);
                        }
                      }}
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[11px] font-medium shrink-0",
                          getBadgeColorClasses(issue.color)
                        )}
                      >
                        {issue.label}
                      </Badge>
                      <Badge variant="outline" className="text-[11px] font-medium tabular-nums shrink-0">
                        {issue.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              );

              // Mobile: no inner ScrollArea — drawer handles scrolling naturally.
              // Desktop popover: keep fixed-height ScrollArea so popover stays compact.
              return isMobile ? issuesList : (
                <ScrollArea className="h-[180px]" scrollbarVariant="thin">
                  {issuesList}
                </ScrollArea>
              );
            })()}
          </div>
        </>
      )}
      
      {/* CTA - Show all issues */}
      {itemsWithIssues > 0 && (
        <Button 
          variant="outline" 
          className="w-full gap-2" 
          size="sm"
          onClick={handleShowAll}
        >
          Переглянути всі проблеми
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  // ============================================
  // TRIGGER BUTTON
  // ============================================

  const TriggerButton = (
    <Button 
      variant="outline" 
      size="sm" 
      className={cn("gap-1.5 h-8", colors.buttonText)}
    >
      {isGood ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <AlertTriangle className="w-3.5 h-3.5" />
      )}
      <span className="tabular-nums">{qualityPercent}%</span>
    </Button>
  );

  // ============================================
  // MOBILE: Drawer
  // ============================================

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {TriggerButton}
        </DrawerTrigger>
        <DrawerContent className="max-h-[85dvh]">
          <DrawerHeader>
            <DrawerTitle>Відповідність</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <Content showHeader={false} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // ============================================
  // DESKTOP: Popover
  // ============================================

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {TriggerButton}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 z-50 bg-background" 
        align="end"
      >
        <Content showHeader={true} />
      </PopoverContent>
    </Popover>
  );
};
