import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Search, 
  FileText, 
  FileCheck2,
  Calendar,
  Check,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";

// Simplified document type for selection
export interface SelectableDocument {
  id: string;
  number: string;
  title: string;
  type: string;
  date: string;
  contractor?: string;
  amount?: number;
}

// AI suggestion interface
export interface AiDocumentSuggestion {
  documentId: string;
  relevance: "high" | "medium" | "low";
  reason: string;
}

// Demo documents for selection
export const demoDocumentsForSelection: SelectableDocument[] = [
  { id: "doc-001", number: "ДОГ-2024-015", title: "Договір з ТОВ «Діджитал Солюшнс»", type: "Договір", date: "2024-03-01", contractor: "ТОВ «Діджитал Солюшнс»" },
  { id: "doc-002", number: "АКТ-2024-012", title: "Акт виконаних робіт №12", type: "Акт", date: "2024-06-15", contractor: "ТОВ «Діджитал Солюшнс»", amount: 15000 },
  { id: "doc-003", number: "РАХ-2024-042", title: "Рахунок на оплату", type: "Рахунок", date: "2024-06-15", contractor: "ТОВ «Діджитал Солюшнс»", amount: 15000 },
  { id: "doc-004", number: "АКТ-2024-018", title: "Акт виконаних робіт №18", type: "Акт", date: "2024-09-30", contractor: "ФОП Петренко І.В.", amount: 8500 },
  { id: "doc-005", number: "ДОГ-2024-022", title: "Договір з ФОП Петренко І.В.", type: "Договір", date: "2024-08-01", contractor: "ФОП Петренко І.В." },
  { id: "doc-006", number: "РАХ-2024-043", title: "Рахунок на оплату", type: "Рахунок", date: "2024-08-15", contractor: "ФОП Петренко І.В.", amount: 8500 },
  { id: "doc-007", number: "ЧЕК-20241001", title: "Фіскальний чек ПРРО", type: "Чек ПРРО", date: "2024-10-01", amount: 2500 },
  { id: "doc-008", number: "ЧЕК-20241115", title: "Фіскальний чек ПРРО", type: "Чек ПРРО", date: "2024-11-15", amount: 3200 },
  { id: "doc-009", number: "ВИП-2024-Q3", title: "Банківська виписка за III кв.", type: "Виписка", date: "2024-10-05" },
  { id: "doc-010", number: "ДЕК-ЄП-Q3", title: "Декларація ЄП за III кв. 2024", type: "Звіт", date: "2024-10-15" },
  { id: "doc-011", number: "КД-2024", title: "Книга обліку доходів 2024", type: "Книга доходів", date: "2024-12-01" },
  { id: "doc-012", number: "ДОГ-2024-018", title: "Договір оренди офісу", type: "Договір", date: "2024-01-15", contractor: "ТОВ «Бізнес-Центр»" },
];

interface AuditDocumentSelectorProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  suggestedDocTypes?: string[];
  aiSuggestions?: AiDocumentSuggestion[];
  maxHeight?: string;
}

// Relevance badge styles
const relevanceBadgeStyles = {
  high: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  low: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/50 dark:text-slate-400 dark:border-slate-700",
};

const relevanceLabels = {
  high: "Ключовий",
  medium: "Пов'язаний",
  low: "Додатковий",
};

export const AuditDocumentSelector = ({ 
  selectedIds, 
  onSelectionChange,
  suggestedDocTypes,
  aiSuggestions,
  maxHeight = "300px"
}: AuditDocumentSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Create a map for quick AI suggestion lookup
  const aiSuggestionMap = useMemo(() => {
    if (!aiSuggestions) return new Map<string, AiDocumentSuggestion>();
    return new Map(aiSuggestions.map(s => [s.documentId, s]));
  }, [aiSuggestions]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return demoDocumentsForSelection.filter((doc) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        doc.number.toLowerCase().includes(query) ||
        doc.title.toLowerCase().includes(query) ||
        doc.type.toLowerCase().includes(query) ||
        doc.contractor?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Sort: AI suggestions by relevance first, then suggested types, then by date
  const sortedDocuments = useMemo(() => {
    const relevanceOrder = { high: 0, medium: 1, low: 2, none: 3 };
    
    return [...filteredDocuments].sort((a, b) => {
      // AI suggestions first (by relevance)
      if (aiSuggestions && aiSuggestions.length > 0) {
        const aSuggestion = aiSuggestionMap.get(a.id);
        const bSuggestion = aiSuggestionMap.get(b.id);
        const aOrder = aSuggestion ? relevanceOrder[aSuggestion.relevance] : relevanceOrder.none;
        const bOrder = bSuggestion ? relevanceOrder[bSuggestion.relevance] : relevanceOrder.none;
        
        if (aOrder !== bOrder) return aOrder - bOrder;
      }
      
      // Suggested types next
      if (suggestedDocTypes && suggestedDocTypes.length > 0) {
        const aIsSuggested = suggestedDocTypes.some(t => a.type.toLowerCase().includes(t.toLowerCase()));
        const bIsSuggested = suggestedDocTypes.some(t => b.type.toLowerCase().includes(t.toLowerCase()));
        if (aIsSuggested && !bIsSuggested) return -1;
        if (!aIsSuggested && bIsSuggested) return 1;
      }
      
      // Then by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filteredDocuments, suggestedDocTypes, aiSuggestions, aiSuggestionMap]);

  const handleToggle = (docId: string) => {
    if (selectedIds.includes(docId)) {
      onSelectionChange(selectedIds.filter(id => id !== docId));
    } else {
      onSelectionChange([...selectedIds, docId]);
    }
  };

  const handleSelectAll = () => {
    const allIds = sortedDocuments.map(d => d.id);
    const allSelected = allIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      onSelectionChange(selectedIds.filter(id => !allIds.includes(id)));
    } else {
      const newIds = [...new Set([...selectedIds, ...allIds])];
      onSelectionChange(newIds);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Пошук документів..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Selection info */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Обрано: <span className="font-medium text-foreground">{selectedIds.length}</span> з {sortedDocuments.length}
        </span>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleSelectAll}>
          {sortedDocuments.every(d => selectedIds.includes(d.id)) ? "Зняти всі" : "Обрати всі"}
        </Button>
      </div>

      {/* Document list */}
      <ScrollArea style={{ maxHeight }} className="border rounded-lg">
        <div className="divide-y">
          {sortedDocuments.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Документів не знайдено
            </div>
          ) : (
            <TooltipProvider delayDuration={300}>
              {sortedDocuments.map((doc) => {
                const isSelected = selectedIds.includes(doc.id);
                const isSuggested = suggestedDocTypes?.some(t => doc.type.toLowerCase().includes(t.toLowerCase()));
                const aiSuggestion = aiSuggestionMap.get(doc.id);
                
                return (
                  <div
                    key={doc.id}
                    className={cn(
                      "flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer",
                      isSelected && "bg-primary/5",
                      aiSuggestion?.relevance === "high" && "bg-emerald-50/30 dark:bg-emerald-950/10"
                    )}
                    onClick={() => handleToggle(doc.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(doc.id)}
                      className="mt-0.5"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{doc.number}</span>
                        <Badge variant="secondary" className="text-xs font-normal">
                          {doc.type}
                        </Badge>
                        
                        {/* AI suggestion badge */}
                        {aiSuggestion && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs font-normal gap-1 cursor-help",
                                  relevanceBadgeStyles[aiSuggestion.relevance]
                                )}
                              >
                                <Bot className="w-3 h-3" />
                                {relevanceLabels[aiSuggestion.relevance]}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-xs">{aiSuggestion.reason}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {/* Suggested badge (only if no AI suggestion) */}
                        {!aiSuggestion && isSuggested && (
                          <Badge variant="outline" className="text-xs font-normal text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50">
                            Рекомендовано
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(parseISO(doc.date), "dd.MM.yyyy", { locale: uk })}
                        </span>
                        {doc.contractor && (
                          <span className="truncate">{doc.contractor}</span>
                        )}
                        {doc.amount && (
                          <span className="font-medium text-foreground">
                            {doc.amount.toLocaleString("uk-UA")} ₴
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </div>
                );
              })}
            </TooltipProvider>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
