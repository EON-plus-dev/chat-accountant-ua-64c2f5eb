import { AlertCircle, CheckCircle2, ChevronRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import { getEntityStyle } from "@/config/entityStyles";

// Helper for FOP group badge
const getFopGroupBadgeClass = (fopGroup: 1 | 2 | 3): string => {
  switch (fopGroup) {
    case 1: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case 2: return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case 3: return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  }
};
/**
 * CabinetRow використовує TableRow + TableCell для семантичного HTML
 * та автоматичного вирівнювання з TableHeader.
 * 
 * Responsive breakpoints через CSS classes:
 * - lg:table-cell — Tax ID, Income
 * - md:table-cell — Type Badge, Deadline
 * - sm:table-cell — Role
 * - Завжди видимі: Avatar, Name, Status, Arrow
 * 
 * Цей патерн консистентний з ContractorsTable, EmployeesTable, DocumentList.
 */
interface CabinetRowProps {
  cabinet: Cabinet;
  onEnter: (cabinet: Cabinet) => void;
}

const CabinetRow = ({ cabinet, onEnter }: CabinetRowProps) => {
  const entityStyle = getEntityStyle(cabinet.type);
  const EntityIcon = entityStyle.icon;

  // Розрахунок терміновості дедлайну
  const getDeadlineInfo = () => {
    if (!cabinet.nextDeadline) return null;
    
    const now = new Date();
    const deadline = new Date(cabinet.nextDeadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let urgencyClass = "text-muted-foreground";
    
    if (diffDays <= 0) {
      urgencyClass = "text-destructive";
    } else if (diffDays <= 3) {
      urgencyClass = "text-destructive";
    } else if (diffDays <= 7) {
      urgencyClass = "text-warning";
    }
    
    let label = "";
    if (diffDays <= 0) {
      label = "Сьогодні!";
    } else if (diffDays === 1) {
      label = "Завтра";
    } else if (diffDays <= 7) {
      label = `${diffDays} дн.`;
    } else {
      label = deadline.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
    }
    
    return { label, urgencyClass };
  };

  const deadlineInfo = getDeadlineInfo();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onEnter(cabinet);
    }
  };

  const isArchived = cabinet.status === "archived";

  return (
    <TableRow 
      className={cn(
        "cursor-pointer group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isArchived && "opacity-60 grayscale"
      )}
      onClick={() => onEnter(cabinet)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Відкрити кабінет ${cabinet.name}`}
    >
      {/* Avatar */}
      <TableCell compact className="w-8 pl-3 pr-0">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border-l-4", entityStyle.bgColor, entityStyle.borderColor)}>
          <EntityIcon className={cn("w-4 h-4", entityStyle.color)} />
        </div>
      </TableCell>

      {/* Name + mobile secondary info */}
      <TableCell compact className="min-w-0">
        <p className="font-medium truncate text-sm" title={cabinet.name}>
          {cabinet.name}
        </p>
        <div className="flex sm:hidden text-xs text-muted-foreground gap-2 mt-0.5">
          <span>{cabinet.roleLabel}</span>
          {deadlineInfo && cabinet.status !== "archived" && (
            <span className={deadlineInfo.urgencyClass}>• {deadlineInfo.label}</span>
          )}
        </div>
      </TableCell>

      {/* Tax ID Code */}
      <TableCell compact className="w-[88px] hidden lg:table-cell">
        <span className="text-xs text-muted-foreground tabular-nums">
          {cabinet.taxId || "—"}
        </span>
      </TableCell>

      {/* Type Badge */}
      <TableCell compact className="w-[84px] text-center hidden md:table-cell">
        <Badge size="sm" className={cn("justify-center", entityStyle.badgeClass)}>
          {entityStyle.label}
        </Badge>
      </TableCell>

      {/* Role */}
      <TableCell compact className="w-[72px] hidden sm:table-cell">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {cabinet.roleLabel}
        </span>
      </TableCell>

      {/* FOP Group */}
      <TableCell compact className="w-16 text-center hidden lg:table-cell">
        {cabinet.type === "fop" && cabinet.fopGroup ? (
          <Badge size="sm" className={cn("justify-center", getFopGroupBadgeClass(cabinet.fopGroup))}>
            {cabinet.fopGroup} гр.
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </TableCell>

      {/* Deadline */}
      <TableCell compact className="w-16 text-center hidden md:table-cell">
        {deadlineInfo && cabinet.status !== "archived" ? (
          <div className="flex items-center justify-center gap-1">
            <Calendar className={cn("w-3 h-3", deadlineInfo.urgencyClass)} />
            <span className={cn("text-xs tabular-nums", deadlineInfo.urgencyClass)}>
              {deadlineInfo.label}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </TableCell>

      {/* Status */}
      <TableCell compact className="w-6 text-center">
        {cabinet.reportStatus === "tasks" ? (
          <AlertCircle className="w-4 h-4 text-warning mx-auto" aria-label="Є задачі" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-success mx-auto" aria-label="Все добре" />
        )}
      </TableCell>

      {/* Arrow Indicator */}
      <TableCell compact className="w-4 pr-3 pl-0">
        <ChevronRight 
          className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" 
          aria-hidden="true" 
        />
      </TableCell>
    </TableRow>
  );
};

export default CabinetRow;
