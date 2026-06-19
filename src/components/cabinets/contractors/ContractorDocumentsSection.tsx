import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ChevronRight, Plus, Search, ChevronDown, AlertCircle } from "lucide-react";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Document } from "@/config/documentFlowConfig";
import { documentTypeConfigs, detectDocumentIssues } from "@/config/documentFlowConfig";
import { statusRowStyles } from "@/config/semanticStyles";
import UnifiedFilterPopover, { type FilterSection } from "@/components/ui/UnifiedFilterPopover";
import { useIsMobile } from "@/hooks/use-mobile";
import emptyReferencesImage from "@/assets/empty-references.png";

interface ContractorDocumentsSectionProps {
  documents: Document[];
  onDocumentClick?: (documentId: string) => void;
  onAddDocument?: () => void;
}

export const ContractorDocumentsSection = ({
  documents,
  onDocumentClick,
  onAddDocument,
}: ContractorDocumentsSectionProps) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const pageSize = 10;

  // Get unique document types for filter options
  const documentTypes = useMemo(() => {
    const types = [...new Set(documents.map(d => d.type))];
    return types.map(type => ({
      value: type,
      label: documentTypeConfigs[type as keyof typeof documentTypeConfigs]?.label || type,
    }));
  }, [documents]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        doc =>
          doc.title.toLowerCase().includes(q) ||
          doc.number.toLowerCase().includes(q) ||
          doc.contractor?.name?.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter(doc => doc.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(doc => doc.status === statusFilter);
    }

    // Sort by date descending
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [documents, searchQuery, typeFilter, statusFilter]);

  // Pagination
  const displayedDocuments = showAll ? filteredDocuments : filteredDocuments.slice(0, pageSize);
  const hasMore = filteredDocuments.length > pageSize && !showAll;

  // Group displayed documents by month
  const groupedByMonth = useMemo(() => {
    const groups: { label: string; docs: Document[] }[] = [];
    const map = new Map<string, Document[]>();
    for (const doc of displayedDocuments) {
      const key = format(parseISO(doc.date), "LLLL yyyy", { locale: uk });
      if (!map.has(key)) {
        const arr: Document[] = [];
        map.set(key, arr);
        groups.push({ label: key.charAt(0).toUpperCase() + key.slice(1), docs: arr });
      }
      map.get(key)!.push(doc);
    }
    return groups;
  }, [displayedDocuments]);

  // Active filters count
  const activeFiltersCount = (typeFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  // Filter sections for UnifiedFilterPopover
  const filterSections: FilterSection[] = [
    {
      id: "type",
      label: "Тип документа",
      options: [{ value: "all", label: "Всі типи" }, ...documentTypes],
      value: typeFilter,
      onChange: setTypeFilter,
      placeholder: "Оберіть тип",
    },
    {
      id: "status",
      label: "Статус",
      options: [
        { value: "all", label: "Всі статуси" },
        { value: "draft", label: "Чернетка" },
        { value: "pending-sign", label: "Очікує підпису" },
        { value: "signed", label: "Підписано" },
        { value: "sent", label: "Відправлено" },
        { value: "confirmed", label: "Підтверджено" },
        { value: "paid", label: "Оплачено" },
        { value: "partially-paid", label: "Частково оплачено" },
        { value: "archived", label: "В архіві" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
      placeholder: "Оберіть статус",
    },
  ];

  const handleResetFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Чернетка",
      "pending-sign": "Очікує підпису",
      signed: "Підписано",
      sent: "Відправлено",
      confirmed: "Підтверджено",
      paid: "Оплачено",
      "partially-paid": "Частково оплачено",
      registered: "Зареєстровано",
      archived: "В архіві",
      cancelled: "Скасовано",
    };
    return labels[status] || status;
  };

  // Group documents by type for stats
  const documentsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  if (documents.length === 0) {
    return (
      <Card className="hover:shadow-md transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Документи
            </CardTitle>
            {onAddDocument && (
              <Button variant="outline" size="sm" onClick={onAddDocument}>
                <Plus className="h-4 w-4 mr-1" />
                Додати
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <img
              src={emptyReferencesImage}
              alt="Немає документів"
              className="h-24 mx-auto mb-4 opacity-60"
            />
            <p className="text-muted-foreground text-sm">
              Документів з цим контрагентом ще немає
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Документи
            <Badge variant="secondary" className="ml-1">
              {documents.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <UnifiedFilterPopover
              sections={filterSections}
              activeFiltersCount={activeFiltersCount}
              onReset={handleResetFilters}
              title="Фільтри документів"
              isMobile={isMobile}
            />
            {onAddDocument && (
              <Button variant="outline" size="sm" onClick={onAddDocument}>
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Додати</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search input */}
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Пошук за назвою або номером..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Summary stats */}
        {(() => {
          const totalAmount = documents.reduce((sum, d) => sum + (d.amount || 0), 0);
          const unpaidCount = documents.filter(d => 
            ["draft", "pending-sign", "sent", "confirmed", "partially-paid"].includes(d.status)
          ).length;
          return (
            <div className="px-4 pb-3 flex flex-wrap gap-3 items-center">
              <span className="text-sm text-muted-foreground">
                Загальна сума:{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {totalAmount.toLocaleString("uk-UA")} ₴
                </span>
              </span>
              {unpaidCount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Неоплачених: {unpaidCount}
                </Badge>
              )}
            </div>
          );
        })()}

        {/* Stats by type */}
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {Object.entries(documentsByType).map(([type, docs]) => {
            const config = documentTypeConfigs[type as keyof typeof documentTypeConfigs];
            return (
              <Badge key={type} variant="outline" className="gap-1">
                {config?.label || type}: {docs.length}
              </Badge>
            );
          })}
        </div>

        {/* Documents list */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-muted-foreground">
              Документів за вказаними фільтрами не знайдено
            </p>
            <Button variant="link" size="sm" onClick={handleResetFilters} className="mt-2">
              Скинути фільтри
            </Button>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y">
              {groupedByMonth.map((group) => {
                const groupTotal = group.docs.reduce((s, d) => s + (d.amount || 0), 0);
                return (
                  <div key={group.label}>
                    {/* Month header */}
                    <div className="bg-muted/50 px-4 py-2 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm border-b">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {group.label}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {group.docs.length} док · {groupTotal.toLocaleString("uk-UA")} ₴
                      </span>
                    </div>
                    {group.docs.map((doc) => {
                      const typeConfig = documentTypeConfigs[doc.type];
                      const issues = detectDocumentIssues(doc);
                      const hasCritical = issues.some((i) =>
                        ["overdue-payment", "expired", "pending-signature"].includes(i)
                      );
                      const rowStyle = hasCritical
                        ? statusRowStyles["critical"]
                        : statusRowStyles[doc.status] || statusRowStyles["neutral"];
                      const Icon = typeConfig?.icon || FileText;

                      return (
                        <div
                          key={doc.id}
                          onClick={() => onDocumentClick?.(doc.id)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 cursor-pointer",
                            "hover:bg-muted/50 transition-colors",
                            "border-l-2",
                            rowStyle.border
                          )}
                        >
                          <div className="rounded-lg bg-muted p-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{doc.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{doc.number}</span>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(new Date(doc.date), {
                                  addSuffix: true,
                                  locale: uk,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {doc.amount && (
                              <p className="font-medium text-sm tabular-nums">
                                {doc.amount.toLocaleString("uk-UA")} ₴
                              </p>
                            )}
                            <Badge variant="outline" className={cn("text-xs mt-1", rowStyle.badge)}>
                              {getStatusLabel(doc.status)}
                            </Badge>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Show more button */}
            {hasMore && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1.5 text-muted-foreground"
                  onClick={() => setShowAll(true)}
                >
                  <ChevronDown className="h-4 w-4" />
                  Показати ще ({filteredDocuments.length - pageSize})
                </Button>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
