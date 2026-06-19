import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  History,
  FileText,
  FileCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Edit,
  PenTool,
  CalendarX,
  Scale,
  MessageSquare,
  RefreshCw,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import {
  getContractorHistory,
  type HistoryEventType,
} from "@/config/contractorHistoryConfig";
import UnifiedFilterPopover, { type FilterSection } from "@/components/ui/UnifiedFilterPopover";
import { useIsMobile } from "@/hooks/use-mobile";

interface ContractorHistorySectionProps {
  contractorId: string;
  onNavigateToDocument?: (documentId: string) => void;
}

const iconMap: Record<HistoryEventType, React.ElementType> = {
  document_created: FileText,
  document_signed: FileCheck,
  payment_received: ArrowDownLeft,
  payment_sent: ArrowUpRight,
  requisites_changed: Edit,
  contract_signed: PenTool,
  contract_expired: CalendarX,
  reconciliation: Scale,
  note_added: MessageSquare,
  status_changed: RefreshCw,
  contact_added: UserPlus,
};

const getEventColor = (type: HistoryEventType): string => {
  switch (type) {
    case "payment_received":
      return "text-green-600 bg-green-100 dark:bg-green-900/30";
    case "payment_sent":
      return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
    case "contract_signed":
    case "document_signed":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
    case "reconciliation":
      return "text-purple-600 bg-purple-100 dark:bg-purple-900/30";
    case "requisites_changed":
    case "status_changed":
      return "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
    default:
      return "text-muted-foreground bg-muted";
  }
};

type FilterType = "all" | "payments" | "documents" | "changes";

export const ContractorHistorySection = ({
  contractorId,
  onNavigateToDocument,
}: ContractorHistorySectionProps) => {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAll, setShowAll] = useState(false);
  const pageSize = 10;

  const events = getContractorHistory(contractorId);

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events;

    const filterMap: Record<FilterType, HistoryEventType[]> = {
      all: [],
      payments: ["payment_received", "payment_sent"],
      documents: [
        "document_created",
        "document_signed",
        "contract_signed",
        "contract_expired",
        "reconciliation",
      ],
      changes: ["requisites_changed", "status_changed", "note_added", "contact_added"],
    };

    return events.filter((e) => filterMap[filter].includes(e.type));
  }, [events, filter]);

  const [periodFilter, setPeriodFilter] = useState<string>("all");

  // Apply period filter
  const periodFilteredEvents = useMemo(() => {
    if (periodFilter === "all") return filteredEvents;
    const now = new Date();
    let cutoff: Date;
    switch (periodFilter) {
      case "month":
        cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "quarter":
        cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "year":
        cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        cutoff = new Date(0);
    }
    return filteredEvents.filter(e => new Date(e.date) >= cutoff);
  }, [filteredEvents, periodFilter]);

  // Pagination
  const displayedEvents = showAll ? periodFilteredEvents : periodFilteredEvents.slice(0, pageSize);
  const hasMore = periodFilteredEvents.length > pageSize && !showAll;

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMM yyyy, HH:mm", { locale: uk });
  };

  const formatAmount = (amount: number, type: HistoryEventType) => {
    const isOutgoing = type === "payment_sent";
    const prefix = isOutgoing ? "-" : "+";
    const color = isOutgoing ? "text-orange-600" : "text-green-600";
    return (
      <span className={cn("font-semibold tabular-nums", color)}>
        {prefix}
        {amount.toLocaleString("uk-UA")} ₴
      </span>
    );
  };

  const filterSections: FilterSection[] = [
    {
      id: "filter",
      label: "Тип подій",
      options: [
        { value: "all", label: "Всі події" },
        { value: "payments", label: "Оплати" },
        { value: "documents", label: "Документи" },
        { value: "changes", label: "Зміни" },
      ],
      value: filter,
      onChange: (v) => setFilter(v as FilterType),
    },
    {
      id: "period",
      label: "Період",
      options: [
        { value: "all", label: "Увесь час" },
        { value: "month", label: "Місяць" },
        { value: "quarter", label: "Квартал" },
        { value: "year", label: "Рік" },
      ],
      value: periodFilter,
      onChange: setPeriodFilter,
    },
  ];

  const activeFiltersCount = (filter !== "all" ? 1 : 0) + (periodFilter !== "all" ? 1 : 0);

  const handleResetFilters = () => {
    setFilter("all");
    setPeriodFilter("all");
  };

  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Історія взаємодій
            <Badge variant="secondary">{periodFilteredEvents.length}</Badge>
          </CardTitle>
          <UnifiedFilterPopover
            sections={filterSections}
            activeFiltersCount={activeFiltersCount}
            onReset={handleResetFilters}
            title="Фільтри історії"
            isMobile={isMobile}
          />
        </div>
      </CardHeader>
      <CardContent>
        {periodFilteredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Немає подій для відображення</p>
            {filter !== "all" && (
              <Button variant="link" size="sm" onClick={handleResetFilters} className="mt-2">
                Скинути фільтр
              </Button>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

            <div className="space-y-4">
              {displayedEvents.map((event, index) => {
                const Icon = iconMap[event.type];
                const colorClass = getEventColor(event.type);
                const isLast = index === displayedEvents.length - 1 && !hasMore;

                return (
                  <div key={event.id} className="relative flex gap-3 pl-1">
                    {/* Icon */}
                    <div
                      className={cn(
                        "relative z-10 flex items-center justify-center w-7 h-7 rounded-full shrink-0",
                        colorClass
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    {/* Content */}
                    <div className={cn("flex-1 min-w-0 pb-4", isLast && "pb-0")}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{event.title}</p>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        {event.amount && formatAmount(event.amount, event.type)}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {formatEventDate(event.date)}
                        </span>
                        {event.user && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{event.user}</span>
                          </>
                        )}
                        {event.linkedDocumentId && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => onNavigateToDocument?.(event.linkedDocumentId!)}
                          >
                            {event.linkedDocumentNumber || "Переглянути"} →
                          </Button>
                        )}
                        {!event.linkedDocumentId && event.linkedDocumentNumber && (
                          <Badge variant="outline" className="text-xs h-5">
                            {event.linkedDocumentNumber}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show more button */}
            {hasMore && (
              <div className="pt-4 pl-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1.5 text-muted-foreground"
                  onClick={() => setShowAll(true)}
                >
                  <ChevronDown className="h-4 w-4" />
                  Показати ще ({periodFilteredEvents.length - pageSize})
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
