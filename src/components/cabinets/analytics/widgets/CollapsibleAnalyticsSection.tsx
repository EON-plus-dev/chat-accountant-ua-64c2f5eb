import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CollapsibleAnalyticsSectionProps {
  title: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  badge?: string | number;
  badgeVariant?: "default" | "success" | "warning" | "error" | "outline";
  children: React.ReactNode;
  id?: string;
  emptyMessage?: string;
}

export const CollapsibleAnalyticsSection = ({
  title,
  icon: Icon,
  defaultOpen = false,
  forceOpen,
  badge,
  badgeVariant = "outline",
  children,
  id,
  emptyMessage,
}: CollapsibleAnalyticsSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  return (
    <div id={id} className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-muted/50 transition-colors rounded-lg"
      >
        <Icon className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium flex-1">{title}</span>
        {badge !== undefined && (
          <Badge variant={badgeVariant} size="sm" className="font-normal">
            {badge}
          </Badge>
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1">
            {emptyMessage ? (
              <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
