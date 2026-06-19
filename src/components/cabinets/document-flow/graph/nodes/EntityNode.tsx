import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { 
  Building2, CreditCard, BookOpen, FolderCheck, ScrollText, FileText,
  type LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type EntityType = "contractor" | "payment" | "income-book" | "audit" | "report" | "document";

interface EntityNodeData {
  label: string;
  entityType: EntityType;
  subtitle?: string;
  status?: string;
  statusColor?: string;
  amount?: string;
  onClick?: () => void;
}

interface EntityNodeProps {
  data: EntityNodeData;
}

const entityConfig: Record<EntityType, { icon: LucideIcon; bgClass: string; borderClass: string; iconClass: string }> = {
  contractor: {
    icon: Building2,
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    borderClass: "border-blue-200 dark:border-blue-800",
    iconClass: "text-blue-600 dark:text-blue-400",
  },
  payment: {
    icon: CreditCard,
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    borderClass: "border-emerald-200 dark:border-emerald-800",
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  "income-book": {
    icon: BookOpen,
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    borderClass: "border-amber-200 dark:border-amber-800",
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  audit: {
    icon: FolderCheck,
    bgClass: "bg-purple-50 dark:bg-purple-950/30",
    borderClass: "border-purple-200 dark:border-purple-800",
    iconClass: "text-purple-600 dark:text-purple-400",
  },
  report: {
    icon: ScrollText,
    bgClass: "bg-slate-50 dark:bg-slate-950/30",
    borderClass: "border-slate-200 dark:border-slate-800",
    iconClass: "text-slate-600 dark:text-slate-400",
  },
  document: {
    icon: FileText,
    bgClass: "bg-sky-50 dark:bg-sky-950/30",
    borderClass: "border-sky-200 dark:border-sky-800",
    iconClass: "text-sky-600 dark:text-sky-400",
  },
};

export const EntityNode = memo(({ data }: EntityNodeProps) => {
  const config = entityConfig[data.entityType] || entityConfig.document;
  const Icon = config.icon;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-1.5 !h-1.5" />
      <div 
        className={cn(
          "px-3 py-2.5 rounded-lg border shadow-sm",
          "min-w-[160px] max-w-[200px] cursor-pointer transition-all hover:shadow-md hover:border-primary/30",
          config.bgClass,
          config.borderClass
        )}
        onClick={data.onClick}
      >
        <div className="flex items-start gap-2">
          <div className={cn("p-1 rounded", config.bgClass)}>
            <Icon className={cn("w-3.5 h-3.5", config.iconClass)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{data.label}</p>
            {data.subtitle && (
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                {data.subtitle}
              </p>
            )}
          </div>
        </div>
        {(data.status || data.amount) && (
          <div className="flex items-center justify-between mt-2 gap-2">
            {data.status && (
              <Badge 
                variant="secondary" 
                className={cn("text-[9px] h-4 px-1.5", data.statusColor)}
              >
                {data.status}
              </Badge>
            )}
            {data.amount && (
              <span className={cn("text-[10px] font-semibold", config.iconClass)}>
                {data.amount}
              </span>
            )}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-1.5 !h-1.5" />
    </>
  );
});

EntityNode.displayName = "EntityNode";
