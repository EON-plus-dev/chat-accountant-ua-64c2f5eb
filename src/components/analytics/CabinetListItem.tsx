import { ChevronRight, Building2, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CabinetListItemProps {
  id: string;
  name: string;
  type?: string;
  value: string | number;
  subtitle?: string;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  onClick?: (id: string) => void;
  className?: string;
}

const typeIcons: Record<string, typeof Building2> = {
  fop: User,
  tov: Building2,
  individual: Users,
  "fop-group": Users,
};

const formatValue = (value: string | number): string => {
  if (typeof value === "number") {
    return new Intl.NumberFormat("uk-UA", { 
      style: "currency", 
      currency: "UAH", 
      maximumFractionDigits: 0 
    }).format(value);
  }
  return value;
};

export function CabinetListItem({
  id,
  name,
  type,
  value,
  subtitle,
  badge,
  badgeVariant = "secondary",
  onClick,
  className,
}: CabinetListItemProps) {
  const TypeIcon = type ? typeIcons[type] || Building2 : Building2;
  
  return (
    <button
      onClick={() => onClick?.(id)}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left min-h-[44px]",
        className
      )}
    >
      <div className="p-2 rounded-md bg-muted shrink-0">
        <TypeIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold tabular-nums">
          {formatValue(value)}
        </span>
        {badge !== undefined && (
          <Badge variant={badgeVariant} className="text-xs shrink-0">
            {badge}
          </Badge>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </button>
  );
}
