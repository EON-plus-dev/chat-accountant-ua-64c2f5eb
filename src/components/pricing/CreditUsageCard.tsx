import { 
  MessageSquare, 
  FileText, 
  Files, 
  BarChart3, 
  CreditCard, 
  Users, 
  Shield, 
  PenTool, 
  MoreHorizontal,
  LucideIcon 
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { uk } from "date-fns/locale";
import { CreditUsageEntry, CreditUsageCategory } from "@/config/pricingData";
import { cn } from "@/lib/utils";

const categoryConfig: Record<CreditUsageCategory, {
  icon: LucideIcon;
  color: string;
  bgColor: string;
}> = {
  ai_session: { icon: MessageSquare, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  document: { icon: FileText, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  document_pack: { icon: Files, color: "text-sky-600 dark:text-sky-400", bgColor: "bg-sky-100 dark:bg-sky-900/30" },
  report: { icon: BarChart3, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  payment: { icon: CreditCard, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
  payroll: { icon: Users, color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-100 dark:bg-indigo-900/30" },
  verification: { icon: Shield, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  signature: { icon: PenTool, color: "text-cyan-600 dark:text-cyan-400", bgColor: "bg-cyan-100 dark:bg-cyan-900/30" },
  other: { icon: MoreHorizontal, color: "text-muted-foreground", bgColor: "bg-muted" },
};

interface CreditUsageCardProps {
  entry: CreditUsageEntry;
  /** When false, only show time (HH:mm) instead of full date — used inside date groups */
  showDate?: boolean;
}

export const CreditUsageCard = ({ entry, showDate = true }: CreditUsageCardProps) => {
  const config = categoryConfig[entry.category];
  const Icon = config.icon;
  const date = new Date(entry.date);
  
  const getDateLabel = () => {
    if (!showDate) {
      return format(date, "HH:mm");
    }
    if (isToday(date)) {
      return `Сьогодні, ${format(date, "HH:mm")}`;
    }
    if (isYesterday(date)) {
      return `Вчора, ${format(date, "HH:mm")}`;
    }
    return format(date, "d MMM, HH:mm", { locale: uk });
  };

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      {/* Icon */}
      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", config.bgColor)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{entry.description}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{getDateLabel()}</span>
          {entry.cabinetName && (
            <>
              <span>·</span>
              <span className="truncate">{entry.cabinetName}</span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <span className="font-semibold text-destructive tabular-nums text-sm">
          {entry.amount.toLocaleString()} кр.
        </span>
        {entry.balanceAfter != null && (
          <p className="text-xs text-muted-foreground tabular-nums">
            Залишок: {entry.balanceAfter.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};
