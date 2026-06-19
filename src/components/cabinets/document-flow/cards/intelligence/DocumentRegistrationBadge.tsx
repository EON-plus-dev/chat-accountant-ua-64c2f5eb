import { FileText, FileSignature, Receipt, BarChart3, Building2, Lock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DocumentCategory } from "@/config/documentFlowConfig";

export interface DocumentRegistrationBadgeProps {
  number: string;
  category: DocumentCategory;
  retentionYears: number;
  retentionDeadline?: string;
  humanVerified?: boolean;
  className?: string;
}

const categoryConfig: Record<DocumentCategory, {
  label: string;
  icon: typeof FileText;
  colorClass: string;
}> = {
  primary: { label: "Первинний", icon: FileText, colorClass: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950/50" },
  contract: { label: "Договірний", icon: FileSignature, colorClass: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950/50" },
  fiscal: { label: "Фіскальний", icon: Receipt, colorClass: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/50" },
  report: { label: "Звітний", icon: BarChart3, colorClass: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/50" },
  bank: { label: "Банківський", icon: Building2, colorClass: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/50" },
  internal: { label: "Внутрішній", icon: Lock, colorClass: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/50" },
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("uk-UA");
  } catch {
    return dateString;
  }
};

export const DocumentRegistrationBadge = ({
  number,
  category,
  retentionYears,
  retentionDeadline,
  humanVerified = false,
  className,
}: DocumentRegistrationBadgeProps) => {
  const config = categoryConfig[category] || categoryConfig.primary;
  const CategoryIcon = config.icon;

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pb-3 border-b border-border/50",
      className
    )}>
      {/* Document Number */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono font-bold text-foreground">
          📄 {number}
        </span>
        
        {/* Category Badge */}
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px] px-1.5 py-0.5 gap-1 font-medium border-0",
            config.colorClass
          )}
        >
          <CategoryIcon className="w-3 h-3" />
          {config.label}
        </Badge>
        
        {/* Human Verified Checkmark */}
        {humanVerified && (
          <Badge 
            variant="outline" 
            className="text-[10px] px-1.5 py-0.5 gap-0.5 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
          >
            <CheckCircle2 className="w-3 h-3" />
            ✓
          </Badge>
        )}
      </div>
      
      {/* Retention Info */}
      {retentionDeadline && (
        <span className="text-xs text-muted-foreground">
          Зберігати до {formatDate(retentionDeadline)} ({retentionYears} р.)
        </span>
      )}
    </div>
  );
};
