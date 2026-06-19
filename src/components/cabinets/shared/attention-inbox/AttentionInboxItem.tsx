import { ChevronRight, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AttentionItem } from "./types";

interface AttentionInboxItemProps {
  item: AttentionItem;
  onMobileTap: (item: AttentionItem) => void;
}

const PRIORITY_DOT: Record<AttentionItem["priority"], string> = {
  critical: "bg-destructive",
  attention: "bg-warning",
  normal: "bg-muted-foreground/40",
};

const PRIORITY_ICON: Record<AttentionItem["priority"], string> = {
  critical: "text-destructive",
  attention: "text-warning",
  normal: "text-muted-foreground",
};

const BADGE_TONE: Record<NonNullable<AttentionItem["badge"]>["tone"], string> = {
  ai: "bg-primary/10 text-primary",
  new: "bg-warning/15 text-warning",
  count: "bg-muted text-foreground/80",
};

export function AttentionInboxItem({ item, onMobileTap }: AttentionInboxItemProps) {
  const isMobile = useIsMobile();
  const Icon = item.icon;
  const hasSecondary = (item.secondaryActions?.length ?? 0) > 0;

  // Mobile: весь рядок clickable
  if (isMobile) {
    return (
      <button
        type="button"
        onClick={() => onMobileTap(item)}
        className={cn(
          "w-full flex items-center gap-2.5 px-4 py-2.5 min-h-[56px] text-left",
          "border-t border-border/60 first:border-t-0",
          "hover:bg-muted/40 active:bg-muted/60 transition-colors",
        )}
      >
        <span
          className={cn("h-2 w-2 rounded-full shrink-0", PRIORITY_DOT[item.priority])}
          aria-hidden
        />
        <Icon className={cn("h-4 w-4 shrink-0", PRIORITY_ICON[item.priority])} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-sm font-medium text-foreground truncate leading-tight">
              {item.title}
            </p>
            {item.badge && (
              <span
                className={cn(
                  "shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium leading-none",
                  BADGE_TONE[item.badge.tone],
                )}
              >
                {item.badge.text}
              </span>
            )}
          </div>
          {item.meta && (
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {item.meta}
            </p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
    );
  }

  // Desktop: розділені CTA + dropdown (якщо є secondary)
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 min-h-[52px]",
        "border-t border-border/60 first:border-t-0",
        "hover:bg-muted/30 transition-colors",
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full shrink-0", PRIORITY_DOT[item.priority])}
        aria-hidden
      />
      <Icon className={cn("h-4 w-4 shrink-0", PRIORITY_ICON[item.priority])} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {item.title}
          </p>
          {item.badge && (
            <span
              className={cn(
                "shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium leading-none",
                BADGE_TONE[item.badge.tone],
              )}
            >
              {item.badge.text}
            </span>
          )}
        </div>
        {item.meta && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {item.meta}
          </p>
        )}
      </div>
      <div className="flex items-center shrink-0">
        <Button
          size="sm"
          variant={item.priority === "critical" ? "destructive" : "default"}
          className={cn("h-8", hasSecondary && "rounded-r-none border-r border-r-background/20")}
          onClick={item.primaryAction.onClick}
        >
          {item.primaryAction.label}
          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </Button>
        {hasSecondary && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant={item.priority === "critical" ? "destructive" : "default"}
                className="h-8 px-1.5 rounded-l-none"
                aria-label="Інші дії"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {item.secondaryActions!.map((action, i) => (
                <DropdownMenuItem key={i} onClick={action.onClick}>
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
