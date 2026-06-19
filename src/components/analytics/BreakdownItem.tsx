import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BreakdownItemProps {
  label: string;
  value: string | number;
  percent?: number;
  color?: string;
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
}

export function BreakdownItem({
  label,
  value,
  percent,
  color = "bg-primary",
  size = "md",
  onClick,
  className,
}: BreakdownItemProps) {
  const Wrapper = onClick ? "button" : "div";
  
  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "w-full text-left",
        onClick && "hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors",
        className
      )}
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-muted-foreground",
            size === "sm" ? "text-xs" : "text-sm"
          )}>
            {label}
          </span>
          <span className={cn(
            "font-semibold tabular-nums",
            size === "sm" ? "text-xs" : "text-sm"
          )}>
            {typeof value === "number" 
              ? new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH", maximumFractionDigits: 0 }).format(value)
              : value
            }
          </span>
        </div>
        {percent !== undefined && (
          <Progress
            value={percent}
            className={cn("h-1.5", size === "sm" && "h-1")}
          />
        )}
      </div>
    </Wrapper>
  );
}
