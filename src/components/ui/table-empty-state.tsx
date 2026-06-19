import { Search, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TableEmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Optional secondary action (rendered as ghost button next to primary) */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Additional actions as ReactNode for more complex layouts */
  actions?: ReactNode;
  className?: string;
}

export const TableEmptyState = ({
  icon: Icon = Search,
  title = "Записів не знайдено",
  description,
  action,
  secondaryAction,
  actions,
  className,
}: TableEmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}
  >
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground mb-1">{title}</p>
    {description && (
      <p className="text-xs text-muted-foreground mb-4 max-w-xs">{description}</p>
    )}
    {action && !actions && (
      <div className="flex flex-wrap gap-2 justify-center">
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
        {secondaryAction && (
          <Button variant="ghost" size="sm" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    )}
    {actions && (
      <div className="flex flex-wrap gap-2 justify-center">
        {actions}
      </div>
    )}
  </div>
);
