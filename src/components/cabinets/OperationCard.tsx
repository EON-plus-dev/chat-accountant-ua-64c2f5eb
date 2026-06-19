import { ChevronRight, Home, Building2, Car, LandPlot, Store, HelpCircle, GraduationCap, Stethoscope, Shield, HeartHandshake, Fuel, Baby } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusClassName, getAmountColor } from "@/config/semanticStyles";
import type { LucideIcon } from "lucide-react";
import type { DemoRecord, OperationsSubTab } from "@/config/operationsConfig";

interface OperationCardProps {
  record: DemoRecord;
  subtab: OperationsSubTab;
  onClick: () => void;
}

// Status to left border color mapping (FinTech pattern)
const statusBorderColors: Record<string, string> = {
  paid: "border-l-emerald-500",
  approved: "border-l-green-500",
  ok: "border-l-emerald-500",
  ready: "border-l-teal-500",
  signed: "border-l-blue-500",
  sent: "border-l-sky-500",
  submitted: "border-l-violet-500",
  pending: "border-l-amber-500",
  warning: "border-l-amber-500",
  draft: "border-l-slate-400",
  overdue: "border-l-red-500",
  error: "border-l-red-500",
};

/** Map property type keyword to Lucide icon */
const typeIconMap: Array<[RegExp, LucideIcon]> = [
  [/квартир/i, Home],
  [/будинок|будівл/i, Building2],
  [/авто|транспорт/i, Car],
  [/ділянк|земл/i, LandPlot],
  [/офіс|гараж|склад/i, Store],
];

export const getTypeIcon = (typeStr: string | number): LucideIcon => {
  const str = String(typeStr);
  return typeIconMap.find(([re]) => re.test(str))?.[1] || HelpCircle;
};

/** Extract type label without emoji */
export const extractTypeLabel = (typeStr: string | number): string => {
  return String(typeStr).replace(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u, "");
};

/** Map tax discount category keyword to Lucide icon */
const categoryIconMap: Array<[RegExp, LucideIcon]> = [
  [/навчання/i, GraduationCap],
  [/лікування|медич/i, Stethoscope],
  [/іпотек/i, Home],
  [/страхуван/i, Shield],
  [/благодійн/i, HeartHandshake],
  [/газ|гбо|переобладн/i, Fuel],
  [/репродукт|екз/i, Baby],
  [/житло|будівн/i, Building2],
];

export const getCategoryIcon = (categoryStr: string | number): LucideIcon => {
  const str = String(categoryStr);
  return categoryIconMap.find(([re]) => re.test(str))?.[1] || HelpCircle;
};

const isPropertySubtab = (subtab: OperationsSubTab) => subtab.id === "property";

/** Shared card wrapper */
const CardWrapper = ({
  borderColor,
  onClick,
  children,
}: {
  borderColor: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    }}
    className={cn(
      "flex items-stretch gap-0 bg-card border border-border/70 rounded-lg overflow-hidden",
      "hover:bg-muted/30 hover:shadow-sm cursor-pointer transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    )}
  >
    <div className={cn("w-1 shrink-0 border-l-[3px]", borderColor)} />
    {children}
  </div>
);

/** Specialized property card layout */
const PropertyCardContent = ({ record, onClick }: { record: DemoRecord; onClick: () => void }) => {
  const { columns, status, statusLabel } = record;
  const typeStr = columns.type || "";
  const TypeIcon = getTypeIcon(typeStr);
  const typeLabel = extractTypeLabel(typeStr);
  const description = String(columns.description || "");
  const share = columns.share ? String(columns.share) : null;
  const area = columns.area && columns.area !== "—" ? String(columns.area) : null;
  const taxYear = columns.taxYear && columns.taxYear !== "—" ? String(columns.taxYear) : null;

  const borderColor = status ? statusBorderColors[status] || "border-l-border" : "border-l-border";

  return (
    <CardWrapper borderColor={borderColor} onClick={onClick}>
      <div className="flex-1 min-w-0 flex items-center gap-3 p-3 pl-2.5">
        {/* Type emoji icon */}
        <div className="shrink-0 rounded-lg bg-primary/10 p-2">
          <TypeIcon className="h-4 w-4 text-primary" />
        </div>

        {/* Name + address + meta */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm leading-tight truncate">
              {typeLabel}
            </span>
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {description}
          </div>
          {(area || share) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              {area && <span>{area}</span>}
              {area && share && <span className="text-border">•</span>}
              {share && <span>Частка {share}</span>}
            </div>
          )}
        </div>

        {/* Right side: tax amount + status */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          {taxYear && (
            <span
              className={cn(
                "text-sm font-semibold tabular-nums leading-tight",
                getAmountColor(taxYear)
              )}
            >
              {taxYear}
            </span>
          )}
          {status && statusLabel && (
            <Badge
              variant="secondary"
              size="sm"
              className={cn("text-[11px] px-1.5 py-0 pointer-events-none", getStatusClassName(status))}
            >
              {statusLabel}
            </Badge>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
      </div>
    </CardWrapper>
  );
};

export const OperationCard = ({ record, subtab, onClick }: OperationCardProps) => {
  // Specialized property card
  if (isPropertySubtab(subtab)) {
    return <PropertyCardContent record={record} onClick={onClick} />;
  }

  // Generic card layout
  const columns = subtab.tableColumns || [];
  const primaryCol = columns[0];
  const secondaryCol = columns.find(c => c.key !== primaryCol?.key && c.key !== "status" && c.key !== "amount");
  const dateCol = columns.find(c => c.key === "date" || c.key.includes("date"));
  const amountCol = columns.find(c => c.key === "amount" || c.align === "right");

  const borderColor = record.status ? statusBorderColors[record.status] || "border-l-border" : "border-l-border";

  return (
    <CardWrapper borderColor={borderColor} onClick={onClick}>
      <div className="flex-1 min-w-0 flex items-center gap-3 p-3 pl-2.5">
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm leading-tight truncate">
              {primaryCol ? record.columns[primaryCol.key] : record.id}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {dateCol && record.columns[dateCol.key] && (
              <>
                <span className="tabular-nums">{record.columns[dateCol.key]}</span>
                {secondaryCol && record.columns[secondaryCol.key] && (
                  <span className="text-border">•</span>
                )}
              </>
            )}
            {secondaryCol && record.columns[secondaryCol.key] && (
              <span className="truncate">{record.columns[secondaryCol.key]}</span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-1">
          {amountCol && record.columns[amountCol.key] && (
            <span
              className={cn(
                "text-sm font-semibold tabular-nums leading-tight",
                getAmountColor(String(record.columns[amountCol.key]))
              )}
            >
              {record.columns[amountCol.key]}
            </span>
          )}
          {record.status && record.statusLabel && (
            <Badge
              variant="secondary"
              size="sm"
              className={cn("text-[11px] px-1.5 py-0 pointer-events-none", getStatusClassName(record.status))}
            >
              {record.statusLabel}
            </Badge>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
      </div>
    </CardWrapper>
  );
};
